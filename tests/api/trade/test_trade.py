"""Tests for trade Lambda handler."""

from trade.app import chance_of_profit


def test_chance_of_profit() -> None:
    """Test chance_of_profit calculates option probability correctly."""
    chance = chance_of_profit(
        stock_price=240.80,
        strike_price=255,
        implied_vol=0.9992,
        rho=-0.0007,
        div_yield=0,
        time=0.00205,
    )
    assert int(chance * 100) == 90
