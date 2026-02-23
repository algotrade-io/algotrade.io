import { useState, useEffect } from "react";
import { Typography, Table, Input } from "antd";
import type { TableColumnsType } from "antd";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { getApiUrl } from "@/utils";
const { Title, Text } = Typography;

interface GymLogEntry {
  Date: string;
  Id: string;
  Weight: number;
  Reps: number;
  Exercise: string;
  Volume: number;
  "1RM": number;
  key?: string | number;
}

const columns: TableColumnsType<GymLogEntry> = [
  {
    title: "Date",
    dataIndex: "Date",
    key: "Date",
    fixed: "left",
  },
  {
    title: "Id",
    dataIndex: "Id",
    key: "Id",
  },
  {
    title: "Weight",
    dataIndex: "Weight",
    key: "Weight",
  },
  {
    title: "Reps",
    dataIndex: "Reps",
    key: "Reps",
  },
  {
    title: "Exercise",
    dataIndex: "Exercise",
    key: "Exercise",
  },
  {
    title: "Volume",
    dataIndex: "Volume",
    key: "Volume",
  },
  {
    title: "1RM",
    dataIndex: "1RM",
    key: "1RM",
  },
];

const GymPage = () => {
  const [log, setLog] = useState<GymLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const url = `${getApiUrl({ localOverride: "prod" })}/exercise_log`;
      fetch(url, { method: "GET" })
        .then((response) => response.json())
        .then((data) => setLog(data))
        .then(() => setLoading(false));
    })();
  }, []);

  return (
    <>
      <Title>Exercise Log</Title>
      <Input.Search
        size="large"
        prefix={<SearchOutlined />}
        allowClear
        enterButton="Search"
        style={{ marginBottom: 16 }}
      />
      <Text>{log.length} results</Text>
      <Table
        loading={
          loading && {
            indicator: <LoadingOutlined style={{ fontSize: 24 }} spin />,
          }
        }
        columns={columns}
        dataSource={log}
        pagination={{ position: ["topRight", "bottomRight"] }}
      // sticky
      />
    </>
  );
};

GymPage.displayName = "Gym";

export default GymPage;
