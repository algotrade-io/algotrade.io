"""Trade Lambda handler for Robinhood options trading."""

import json
import os
import re
from collections import defaultdict
from datetime import datetime, timedelta
from math import ceil, floor, log, sqrt
from pathlib import Path
from random import random
from statistics import NormalDist
from time import sleep
from typing import Any

import boto3
import pyotp
import robin_stocks.robinhood as rh
from botocore.exceptions import ClientError

if str(os.environ.get("LOCAL")).lower() == "true":
    from src.api.shared.python.auth import verify_token
    from src.api.shared.python.utils import (
        error,
        options,
        str_to_bool,
        success,
        verify_user,
    )
else:
    from auth import verify_token

    from utils import error, options, str_to_bool, success, verify_user

s3 = boto3.resource("s3")


def calc_d1(
    stock_price: float,
    strike_price: float,
    implied_vol: float,
    rho: float,
    div_yield: float,
    time: float,
) -> float:
    """Calculate d1 for Black-Scholes option pricing.

    Args:
        stock_price: Current stock price.
        strike_price: Option strike price.
        implied_vol: Implied volatility (decimal).
        rho: Risk-free interest rate (decimal).
        div_yield: Dividend yield (decimal).
        time: Time to expiration in years.

    Returns:
        d1 value for Black-Scholes formula.
    """
    numerator = (
        log(stock_price / strike_price)
        + (rho - div_yield + (implied_vol**2) / 2) * time
    )
    denominator = implied_vol * sqrt(time)
    return numerator / denominator


def calc_d2(d1: float, implied_vol: float, time: float) -> float:
    """Calculate d2 for Black-Scholes option pricing.

    Args:
        d1: d1 value from calc_d1.
        implied_vol: Implied volatility (decimal).
        time: Time to expiration in years.

    Returns:
        d2 value for Black-Scholes formula.
    """
    return d1 - implied_vol * sqrt(time)


def chance_of_profit(**kwargs: float) -> float:
    """Calculate probability of profit for a short call option.

    Args:
        **kwargs: Arguments for calc_d1 (stock_price, strike_price, etc).

    Returns:
        Probability of profit (0-1).
    """
    d1 = calc_d1(**kwargs)
    d2 = calc_d2(d1, kwargs["implied_vol"], kwargs["time"])
    return 1 - NormalDist().cdf(d2)


def handle_trade(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Handle trade GET request for portfolio holdings.

    Args:
        event: API Gateway event.
        _: Lambda context (unused).

    Returns:
        API response with holdings data or error.
    """
    if event["httpMethod"].upper() == "OPTIONS":
        return options()

    verified = verify_user(event)

    if not (verified and verified["email"] == os.environ["RH_USERNAME"]):
        return error(401, "This account is not verified.")
    params = event["queryStringParameters"]
    variant = str_to_bool(str(params and params.get("variant")))
    login(variant)
    response = get_trade()
    return response


def handle_ws(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Handle WebSocket trade request.

    Args:
        event: WebSocket event with trade instructions.
        _: Lambda context (unused).

    Returns:
        Success response after executing trade.
    """
    verified = verify_token(event)

    if not (verified and verified["email"] == os.environ["RH_USERNAME"]):
        print("websocket auth failure")
        return error(401, "This account is not verified.")

    context = event["requestContext"]
    domain = context["domainName"]
    connection = context["connectionId"]
    callback = f"https://{domain}"

    client = boto3.client("apigatewaymanagementapi", endpoint_url=callback)
    req_body = json.loads(event["body"])
    variant = bool(req_body.get("variant"))
    login(variant)
    response = post_trade(event)
    data = response["body"]
    client.post_to_connection(Data=data.encode("utf-8"), ConnectionId=connection)
    client.delete_connection(ConnectionId=connection)
    client.close()

    return success("OK")


def login(variant: bool = False) -> None:
    """Login to Robinhood with cached credentials or fresh auth.

    Args:
        variant: Use alternate account credentials if True.
    """
    postfix = "2" if variant else ""
    ext = ".pickle"
    filename = "robinhood"
    auth_path = os.path.join(os.path.expanduser("~"), ".tokens", f"{filename}{ext}")
    key = f"data/{filename}{postfix}{ext}"
    bucket = s3.Bucket(os.environ["S3_BUCKET"])
    try:
        Path(auth_path).parent.mkdir(parents=True, exist_ok=True)
        with open(auth_path, "wb") as file:
            bucket.download_fileobj(key, file)
            print("Loaded auth file from S3.")
    except ClientError:
        print("Could not load auth file from S3.")
        if os.path.exists(auth_path):
            os.remove(auth_path)

    username = os.environ[f"RH_USERNAME{postfix}"]
    password = os.environ[f"RH_PASSWORD{postfix}"]
    mfa_code = pyotp.TOTP(os.environ[f"RH_2FA{postfix}"]).now()

    try:
        rh.login(username, password, mfa_code=mfa_code)
    except Exception as e:
        print(f"Robinhood login failed: {type(e).__name__}: {e}")
        raise RuntimeError(
            "Failed to authenticate with Robinhood. "
            "Check credentials and 2FA configuration."
        ) from e

    try:
        if os.path.exists(auth_path):
            bucket.upload_file(auth_path, key)
            print("Saved auth file to S3.")
    except Exception as e:
        print(f"Warning: Could not save auth file to S3: {e}")


def get_trade() -> dict[str, Any]:
    """Get current holdings with options positions.

    Returns:
        API response with holdings data.
    """
    holdings = rh.build_holdings()
    for symbol, holding in holdings.items():
        holdings[symbol]["symbol"] = symbol
        holdings[symbol]["open_contracts"] = 0
        price = float(holding["price"])
        quant = (
            float(holding["quantity"]) % 100 if float(holding["quantity"]) > 100 else 0
        )
        amt = quant * price
        holdings[symbol]["loose"] = amt

    opts = rh.options.get_open_option_positions()
    for opt in opts:
        sold = -1 if opt["type"] == "short" else 1
        symbol = opt["chain_symbol"]
        if symbol not in holdings:
            holdings[symbol] = {}
        holdings[symbol]["open_contracts"] += int(float(opt["quantity"])) * sold
        opt = rh.options.get_option_instrument_data_by_id(opt["option_id"])
        holdings[symbol]["option_type"] = opt["type"][0].upper()
        holdings[symbol]["expiration"] = opt["expiration_date"]
        holdings[symbol]["strike"] = float(opt["strike_price"])
        opt = rh.options.get_option_market_data_by_id(opt["id"])[0]
        postfix = "short" if holdings[symbol]["open_contracts"] < 0 else "long"
        chance = opt[f"chance_of_profit_{postfix}"]
        holdings[symbol]["chance"] = float(chance) if chance else chance
    sorted_holdings = sorted(
        [holding for _, holding in holdings.items()],
        key=lambda holding: holding["symbol"],
    )
    body = [holding | {"key": idx} for idx, holding in enumerate(sorted_holdings)]
    return success(body)


def post_trade(event: dict[str, Any]) -> dict[str, Any]:
    """Execute buy or sell trades for given symbols.

    Args:
        event: API Gateway event with trade details.

    Returns:
        Success response with trade results.
    """
    req_body = json.loads(event["body"])
    trade_type = req_body["type"]
    symbols = req_body["symbols"]
    trade = Buy() if trade_type.upper() == "BUY" else Sell()
    results = trade.execute(symbols)
    return success(results)


def get_week(date: datetime) -> list[datetime]:
    """Get all days in the week containing the given date.

    Args:
        date: Date to find week for.

    Returns:
        List of 7 datetime objects (Sunday to Saturday).
    """
    one_day = timedelta(days=1)
    day_idx = (date.weekday() + 1) % 7
    sunday = date - timedelta(days=day_idx)
    return [i * one_day + sunday for i in range(7)]


def get_mid_price(opt: dict[str, Any]) -> float:
    """Calculate mid-point between bid and ask price.

    Args:
        opt: Option data with ask_price and bid_price.

    Returns:
        Mid-point price.
    """
    return (float(opt["ask_price"]) + float(opt["bid_price"])) / 2


def round_to_tick(n: float, decimals: int = 0, direction: str = "UP") -> float:
    """Round a number to specified decimal places.

    Args:
        n: Number to round.
        decimals: Number of decimal places.
        direction: 'UP' for ceiling, 'DOWN' for floor.

    Returns:
        Rounded number.
    """
    fx = ceil if direction.upper() == "UP" else floor
    multiplier = 10**decimals
    return fx(n * multiplier) / multiplier


def suggest_contracts() -> tuple[dict[str, int], dict[str, float]]:
    """Calculate available contracts and prices for each holding.

    Returns:
        Tuple of (available contracts dict, prices dict).
    """
    holdings = rh.build_holdings()
    max_contracts = {
        symbol: int(float(holding["quantity"]) / 100)
        for symbol, holding in holdings.items()
    }
    instr_to_symbol_lookup = {
        holding["id"]: symbol for symbol, holding in holdings.items()
    }
    positions = rh.account.get_open_stock_positions()
    curr_contracts: dict[str, int] = defaultdict(
        int,
        {
            instr_to_symbol_lookup[position["instrument_id"]]: int(
                float(position["shares_held_for_options_collateral"]) / 100
            )
            for position in positions
        },
    )
    available_contracts = {
        symbol: max_contract - curr_contracts[symbol]
        for symbol, max_contract in max_contracts.items()
    }
    prices = {symbol: float(holding["price"]) for symbol, holding in holdings.items()}
    return available_contracts, prices


def get_expirations(expirations: list[str], num: int = 2) -> list[str]:
    """Get upcoming expiration dates excluding current week.

    Args:
        expirations: List of expiration date strings.
        num: Number of expirations to return.

    Returns:
        List of expiration date strings.
    """
    today = datetime.now()
    week = {datetime.strftime(day, "%Y-%m-%d") for day in get_week(today)}
    idx = 0
    for _, exp in enumerate(expirations):
        if exp not in week:
            break
    offset = int(bool(idx))
    exp_candidates = expirations[idx - offset : idx + num - offset]
    return exp_candidates


def get_contracts(
    symbol: str, expiration: str, curr_price: float, num: int = 2
) -> list[dict[str, Any]]:
    """Get best option contracts for covered call selling.

    Args:
        symbol: Stock symbol.
        expiration: Expiration date string.
        curr_price: Current stock price.
        num: Max number of contracts to return.

    Returns:
        List of option contract dicts.
    """
    min_price = 0.05
    key = "high_fill_rate_sell_price"
    opt_candidates = rh.options.find_options_by_specific_profitability(
        symbol, expiration, None, "call", "chance_of_profit_short", 0.85, 0.95
    )
    opt_candidates = [
        opt for opt in opt_candidates if float(opt["strike_price"]) > curr_price
    ]

    opt_candidates.sort(
        key=lambda opt: abs(float(opt["chance_of_profit_short"]) - 0.88)
    )
    contracts = [
        opt
        for opt in opt_candidates
        if (float(opt[key]) if key in opt and opt[key] else get_mid_price(opt))
        >= min_price
    ]
    return contracts[0:num]


def spread_is_high(mid_price: float, price: float) -> bool:
    """Check if bid-ask spread is too wide for trading.

    Args:
        mid_price: Calculated mid-point price.
        price: Proposed trade price.

    Returns:
        True if spread exceeds 20%.
    """
    print("mid_price", mid_price)
    print("price", price)
    is_high = abs((mid_price - price) / mid_price) > 0.2
    print("is_high", is_high)
    return is_high


def update_contract(symbol: str, lookup: dict[str, Any]) -> dict[str, Any]:
    """Refresh market data for a specific contract.

    Args:
        symbol: Stock symbol.
        lookup: Trading state lookup dict.

    Returns:
        Updated lookup dict.
    """
    option = lookup[symbol]
    curr = option["curr"]
    contracts = option["contracts"]
    old = contracts[curr[0]][curr[1]]
    new = rh.options.get_option_market_data_by_id(old["id"])[0]
    lookup[symbol]["contracts"][curr[0]][curr[1]] = old | new
    return lookup


def delay() -> None:
    """Random delay between 5-10 seconds for rate limiting."""
    sleep(random() * 5 + 5)


class Trade:
    """Base class for option trading strategies."""

    def execute(self, symbols: list[str]) -> dict[str, Any]:
        """Execute trades for given symbols.

        Args:
            symbols: List of stock symbols to trade.

        Returns:
            Dict of trade results by symbol.
        """
        results: dict[str, Any] = {}
        lookup = self.init_chain(symbols)

        while set(lookup.keys()) != set(results.keys()):
            orders = self.execute_orders(lookup, results)
            delay()
            lookup, results = self.adjust_orders(orders, lookup, results)
        return results

    def init_chain(self, symbols: list[str]) -> dict[str, Any]:
        """Initialize option chain data for symbols.

        Args:
            symbols: List of stock symbols.

        Returns:
            Lookup dict with chain data.
        """
        raise NotImplementedError

    def execute_orders(
        self, lookup: dict[str, Any], results: dict[str, Any]
    ) -> dict[str, Any]:
        """Place orders for remaining symbols.

        Args:
            lookup: Trading state lookup dict.
            results: Current results dict.

        Returns:
            Dict of order responses.
        """
        raise NotImplementedError

    def adjust_option(
        self, symbol: str, lookup: dict[str, Any], results: dict[str, Any]
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Adjust order parameters after failure.

        Args:
            symbol: Stock symbol.
            lookup: Trading state lookup dict.
            results: Current results dict.

        Returns:
            Updated (lookup, results) tuple.
        """
        raise NotImplementedError

    def adjust_orders(
        self,
        orders: dict[str, Any],
        lookup: dict[str, Any],
        results: dict[str, Any],
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Check order status and adjust failed orders.

        Args:
            orders: Dict of order responses.
            lookup: Trading state lookup dict.
            results: Current results dict.

        Returns:
            Updated (lookup, results) tuple.
        """
        for symbol in orders:
            order_id = orders[symbol].get("id")
            if order_id:
                rh.orders.cancel_option_order(order_id)
                order = rh.orders.get_option_order_info(order_id)
            if order_id and order["state"] == "filled":
                results[symbol] = order
            elif not order_id or order["state"] == "cancelled":
                lookup, results = self.adjust_option(symbol, lookup, results)
        return lookup, results


class Sell(Trade):
    """Sell covered call options."""

    def init_chain(self, symbols: list[str]) -> dict[str, Any]:
        """Initialize option chain for selling covered calls.

        Args:
            symbols: List of stock symbols.

        Returns:
            Lookup dict with chain and contract data.
        """
        desired_contracts, prices = suggest_contracts()
        symbols = [symbol for symbol in symbols if desired_contracts[symbol]]
        lookup = {
            symbol: {
                "quantity": desired_contracts[symbol],
                "curr": [0, 0, 0],
                "price": prices[symbol],
            }
            for symbol in symbols
        }

        for symbol in lookup:
            print("symbol in init_chain lookup", symbol)
            chain = rh.options.get_chains(symbol)
            price = lookup[symbol]["price"]
            expirations = chain["expiration_dates"]
            expirations = get_expirations(expirations)
            lookup[symbol]["expirations"] = expirations
            contracts = [get_contracts(symbol, exp, price) for exp in expirations]
            lookup[symbol]["contracts"] = contracts
        return lookup

    def get_price(self, contract: dict[str, Any], offset: int) -> float:
        """Calculate limit price for selling option.

        Args:
            contract: Option contract data.
            offset: Price offset for retries.

        Returns:
            Limit price for sell order.
        """
        mid_price = get_mid_price(contract)
        price = round_to_tick(mid_price, 2, "UP")
        min_tick = float(contract["min_ticks"]["below_tick"])
        price = ceil(price / min_tick) * min_tick
        price -= min_tick * offset
        return round_to_tick(price, 2, "UP")

    def adjust_option(
        self, symbol: str, lookup: dict[str, Any], results: dict[str, Any]
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Adjust sell order parameters after failure.

        Args:
            symbol: Stock symbol.
            lookup: Trading state lookup dict.
            results: Current results dict.

        Returns:
            Updated (lookup, results) tuple.
        """
        option = lookup[symbol]
        curr = option["curr"]
        print(f"adjusting option... {symbol}")
        print(f"before curr: {curr}")
        contracts = option["contracts"]
        if not contracts[curr[0]]:
            print("not on first expiration date")
            if curr[0] == len(option["expirations"]) - 1:
                print("already on last expiration date - error: options exhausted")
                results[symbol] = {"error": "EXHAUSTED"}
            else:
                print(
                    "iterating to next expiration, resetting contract and price indices"
                )
                lookup[symbol]["curr"] = [curr[0] + 1, 0, 0]
        else:
            print("iterating price index")
            curr[2] += 1
            contract = contracts[curr[0]][curr[1]]
            mid_price = get_mid_price(contract)
            price = self.get_price(contract, curr[2])

            if spread_is_high(mid_price, price):
                print(
                    symbol,
                    f"""
                    Price spread is high.
                    Bid: {float(contract["bid_price"])}
                    Ask: {float(contract["ask_price"])}
                    Mid: {mid_price} Price: {price}
                    """,
                )
                print("spread is too high")
                print("resetting price index")
                curr[2] = 0
                if curr[1] == len(contracts[curr[0]]) - 1:
                    print("on last contract - resetting contract idx")
                    curr[1] = 0
                    if curr[0] == len(option["expirations"]) - 1:
                        print("on last expiration - error: options exhausted")
                        results[symbol] = {"error": "EXHAUSTED"}
                    else:
                        print("iterating expiration date")
                        print("Seeking further expiration date...")
                        curr[0] += 1
                else:
                    print("iterating contract idx")
                    curr[1] += 1
        print(f"after curr: {curr}")
        print(f"lookup curr: {lookup[symbol]['curr']}")
        print(f"currs match: {curr == lookup[symbol]['curr']}")
        lookup[symbol]["curr"] = curr
        lookup = update_contract(symbol, lookup)
        return lookup, results

    def execute_orders(
        self, lookup: dict[str, Any], results: dict[str, Any]
    ) -> dict[str, Any]:
        """Execute sell orders for remaining symbols.

        Args:
            lookup: Trading state lookup dict.
            results: Current results dict.

        Returns:
            Dict of order responses.
        """
        remaining = [symbol for symbol in lookup if symbol not in results]
        orders: dict[str, Any] = {}
        for idx, symbol in enumerate(remaining):
            option = lookup[symbol]
            curr = option["curr"]
            print(f"executing order... {symbol}")
            print(f"curr: {curr}")
            expiration = option["expirations"][curr[0]]
            contract_candidates = option["contracts"][curr[0]]
            if contract_candidates:
                contract = contract_candidates[curr[1]]

                strike = float(contract["strike_price"])
                price = self.get_price(contract, curr[2])
                quantity = option["quantity"]

                order = rh.orders.order_sell_option_limit(
                    "open",
                    "credit",
                    price,
                    symbol,
                    quantity,
                    expiration,
                    strike,
                    "call",
                )
                print("Order:", json.dumps(order))
                orders[symbol] = order
            else:
                orders[symbol] = {"state": "cancelled"}
            if idx == len(remaining) - 1:
                delay()
        return orders


class SellOut(Trade):
    """Sell out of existing positions (roll out)."""

    def init_chain(self, symbols: list[str]) -> dict[str, Any]:
        """Initialize option chain for selling out.

        Args:
            symbols: List of stock symbols.

        Returns:
            Lookup dict with chain and contract data.
        """
        desired_contracts, prices = suggest_contracts()
        symbols = [symbol for symbol in symbols if desired_contracts[symbol]]
        lookup = {
            symbol: {
                "quantity": desired_contracts[symbol],
                "curr": [0, 0, 0],
                "price": prices[symbol],
            }
            for symbol in symbols
        }

        for symbol in lookup:
            print("symbol in init_chain lookup", symbol)
            chain = rh.options.get_chains(symbol)
            price = lookup[symbol]["price"]
            expirations = chain["expiration_dates"]
            expirations = get_expirations(expirations)
            lookup[symbol]["expirations"] = expirations
            contracts = [get_contracts(symbol, exp, price) for exp in expirations]
            lookup[symbol]["contracts"] = contracts
        return lookup


class SellIn(Trade):
    """Sell into new positions (roll in)."""

    pass


class Buy(Trade):
    """Buy to close short call options."""

    def init_chain(self, symbols: list[str]) -> dict[str, Any]:
        """Initialize option chain for buying to close.

        Args:
            symbols: List of stock symbols.

        Returns:
            Lookup dict with position and contract data.
        """
        opts = rh.options.get_aggregate_open_positions()
        symbol_set = set(symbols)
        pattern = (
            r"[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}"
        )
        tradeable = {
            opt["symbol"]: {
                "quantity": int(float(opt["quantity"])),
                "expiration": opt["legs"][0]["expiration_date"],
                "strike": float(opt["legs"][0]["strike_price"]),
                "curr": 0,
                "id": (
                    re.search(pattern, opt["legs"][0]["option"], re.IGNORECASE)
                    or re.search(pattern, opt["strategy_code"], re.IGNORECASE)
                )[0],
            }
            for opt in opts
            if (opt["symbol"] in symbol_set and opt["strategy"] == "short_call")
        }
        lookup = {
            symbol: info
            | {
                "contract": rh.options.get_option_market_data_by_id(info["id"])[0]
                | {
                    "min_ticks": rh.options.get_option_instrument_data_by_id(
                        info["id"]
                    )["min_ticks"]
                }
            }
            for symbol, info in tradeable.items()
        }
        return lookup

    def get_price(self, contract: dict[str, Any], offset: int) -> float:
        """Calculate limit price for buying option.

        Args:
            contract: Option contract data.
            offset: Price offset for retries.

        Returns:
            Limit price for buy order.
        """
        mid_price = get_mid_price(contract)
        price = round_to_tick(mid_price, 2, "DOWN")
        min_tick = float(contract["min_ticks"]["above_tick"])
        price = floor(price / min_tick) * min_tick
        price += min_tick * offset
        return round_to_tick(price, 2, "DOWN")

    def adjust_option(
        self, symbol: str, lookup: dict[str, Any], results: dict[str, Any]
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Adjust buy order parameters after failure.

        Args:
            symbol: Stock symbol.
            lookup: Trading state lookup dict.
            results: Current results dict.

        Returns:
            Updated (lookup, results) tuple.
        """
        option = lookup[symbol]
        option["curr"] += 1
        curr = option["curr"]
        contract = option["contract"]
        mid_price = get_mid_price(contract)
        price = self.get_price(contract, curr)

        if spread_is_high(mid_price, price):
            print(
                symbol,
                f"""
                Price spread is high.
                Bid: {float(contract["bid_price"])}
                Ask: {float(contract["ask_price"])}
                Mid: {mid_price} Price: {price}
                """,
            )

        lookup[symbol] = option
        return lookup, results

    def execute_orders(
        self, lookup: dict[str, Any], results: dict[str, Any]
    ) -> dict[str, Any]:
        """Execute buy orders for remaining symbols.

        Args:
            lookup: Trading state lookup dict.
            results: Current results dict.

        Returns:
            Dict of order responses.
        """
        remaining = [symbol for symbol in lookup if symbol not in results]
        orders: dict[str, Any] = {}
        for idx, symbol in enumerate(remaining):
            option = lookup[symbol]
            quantity = option["quantity"]
            expiration = option["expiration"]
            strike = option["strike"]
            price = self.get_price(option["contract"], option["curr"])
            order = rh.orders.order_buy_option_limit(
                "close", "debit", price, symbol, quantity, expiration, strike, "call"
            )
            print("Order:", json.dumps(order))
            orders[symbol] = order
            if idx == len(remaining) - 1:
                delay()
        return orders


def roll_out(symbols: list[str]) -> dict[str, Any]:
    """Roll out expiring options to later expiration.

    Args:
        symbols: List of stock symbols.

    Returns:
        Trade results dict.
    """
    trade = Buy()
    trade.execute(symbols)
    trade_out = SellOut()
    sell_results = trade_out.execute(symbols)
    return sell_results


def roll_in(symbols: list[str]) -> dict[str, Any]:
    """Roll in options to earlier expiration.

    Args:
        symbols: List of stock symbols.

    Returns:
        Trade results dict.
    """
    trade = Buy()
    trade.execute(symbols)
    trade_in = SellIn()
    sell_results = trade_in.execute(symbols)
    return sell_results
