"""Tests for model Lambda handler."""

import json
from datetime import datetime

import numpy as np
import pytest
from model.app import NumpyEncoder, get_model, get_visualization
from shared.python.utils import DATE_FMT


def test_get_model() -> None:
    """Test get_model returns model metadata with expected fields."""
    event = {"headers": {"origin": "https://dev.algotrade.io"}}
    res = get_model(event, None)
    assert res["statusCode"] == 200
    data = json.loads(res["body"])
    assert {"created", "start", "end", "num_features", "accuracy"}.issubset(data.keys())
    created = datetime.strptime(data["created"], DATE_FMT)
    start = datetime.strptime(data["start"], DATE_FMT)
    end = datetime.strptime(data["end"], DATE_FMT)
    assert end > start
    assert start < created
    assert isinstance(data["num_features"], int)
    assert isinstance(data["accuracy"], float)
    assert data["accuracy"] <= 1.0
    assert res["headers"]["Access-Control-Allow-Origin"] == "https://dev.algotrade.io"


def _verify_visualization(data: dict, dims: str | int) -> None:
    """Verify visualization data structure for given dimensions."""
    if isinstance(dims, str):
        dims = int(dims[0])
    assert len(data["centroid"]) == dims
    assert len(data["grid"]) == dims
    assert len(data["actual"]) == dims
    for datum in data["actual"]:
        assert "BUY" in datum
        assert "SELL" in datum
        assert len(datum["BUY"])
        assert len(datum["SELL"])
    assert isinstance(data["radius"], float)
    assert len(data["preds"])
    assert set(data["preds"]) == {0, 1}


def test_get_visualization() -> None:
    """Test get_visualization returns dimensionality reduction data."""
    for dims in ["2D", "3D"]:
        event = {
            "queryStringParameters": {"dims": dims},
            "headers": {"origin": "https://dev.algotrade.io"},
        }
        res = get_visualization(event, None)
        assert res["statusCode"] == 200
        data = json.loads(res["body"])
        assert {"actual", "centroid", "radius", "grid", "preds"}.issubset(data.keys())
        _verify_visualization(data, dims)
        assert (
            res["headers"]["Access-Control-Allow-Origin"] == "https://dev.algotrade.io"
        )


encoder = NumpyEncoder()


class TestNumpyEncoder:
    """Tests for NumpyEncoder JSON serialization."""

    def test_default(self) -> None:
        """Test default method handles numpy types correctly."""
        # list
        arr = np.array([True, False])
        with pytest.raises(TypeError):
            json.dumps(arr)
        assert json.dumps(NumpyEncoder().default(arr)) == "[true, false]"

        # bool
        val = np.True_
        with pytest.raises(TypeError):
            json.dumps(val)
        assert json.dumps(NumpyEncoder().default(val)) == "true"

        # int
        val = np.int64(1)
        with pytest.raises(TypeError):
            json.dumps(val)
        assert json.dumps(NumpyEncoder().default(val)) == "1"

        # # float
        val = np.float64(0.5)
        assert json.dumps(NumpyEncoder().default(val)) == "0.5"

        # complex
        val = np.complex64(1 + 2j)
        with pytest.raises(TypeError):
            json.dumps(val)
        assert json.dumps(NumpyEncoder().default(val)) == '{"real": 1.0, "imag": 2.0}'

        # void
        dt = np.dtype([("x", np.int64)])
        x = np.array([(0)], dtype=dt)
        val = x[0]
        with pytest.raises(TypeError):
            json.dumps(val)
        assert json.dumps(NumpyEncoder().default(val)) == "null"

        # other
        arr = []
        with pytest.raises(TypeError):
            json.dumps(NumpyEncoder().default(arr))
        assert json.dumps(arr) == "[]"
