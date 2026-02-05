import json
import sys
from datetime import datetime

import numpy as np
import pytest

sys.path.append("src/api")  # noqa
from model.app import *  # noqa
from shared.python.utils import DATE_FMT  # noqa


def test_get_model():
    res = get_model()
    assert res["statusCode"] == 200
    data = json.loads(res["body"])
    assert {"created", "start", "end", "num_features", "accuracy"}.issubset(
        data.keys()
    )
    created = datetime.strptime(data["created"], DATE_FMT)
    start = datetime.strptime(data["start"], DATE_FMT)
    end = datetime.strptime(data["end"], DATE_FMT)
    assert end > start
    assert start < created
    assert type(data["num_features"]) == int
    assert type(data["accuracy"]) == float
    assert data["accuracy"] <= 1.0
    assert res["headers"]["Access-Control-Allow-Origin"] == "*"


def verify_visualization(data, dims):
    if type(dims) == str:
        dims = int(dims[0])
    assert len(data["centroid"]) == dims
    assert len(data["grid"]) == dims
    assert len(data["actual"]) == dims
    for datum in data["actual"]:
        assert "BUY" in datum
        assert "SELL" in datum
        assert len(datum["BUY"])
        assert len(datum["SELL"])
    assert type(data["radius"]) == float
    assert len(data["preds"])
    assert set(data["preds"]) == {0, 1}


def test_get_visualization():
    for dims in ["2D", "3D"]:
        event = {"queryStringParameters": {"dims": dims}}
        res = get_visualization(event, None)
        assert res["statusCode"] == 200
        data = json.loads(res["body"])
        assert {"actual", "centroid", "radius", "grid", "preds"}.issubset(
            data.keys()
        )
        verify_visualization(data, dims)
        assert res["headers"]["Access-Control-Allow-Origin"] == "*"


encoder = NumpyEncoder()


class TestNumpyEncoder:
    def test_default(self):
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
