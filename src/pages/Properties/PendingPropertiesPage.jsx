import React, { useEffect, useState } from "react";
import { Table, Button, Input, Select, DatePicker, Tag, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getPendingProperties, approveProperty } from "../../redux/slices/propertySlice";
import Swal from "sweetalert2";
import { toastSuccess, toastError } from "../../utils/toast";
import { SearchOutlined, CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const PendingPropertiesPage = () => {
  const dispatch = useDispatch();
  const { pendingProperties, loading, pagination } = useSelector((state) => state.property);
console.log(":properties", pendingProperties)
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  useEffect(() => {
    fetchPending();
  }, [page, pageSize]);

  const fetchPending = () => {
    dispatch(getPendingProperties({ page: page - 1, size: pageSize}));
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Approve this property?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      dispatch(approveProperty(id)).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          toastSuccess("Property approved");
          fetchPending();
        } else {
          toastError("Approval failed");
        }
      });
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      render: (text, record) => <b>{text}</b>,
    },
    {
      title: "District",
      dataIndex: "districtName",
    },
    {
      title: "Owner",
      dataIndex: ["owner", "name"],
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (val) => dayjs(val).format("DD MMM YYYY"),
      sorter: true,
    },
    {
      title: "Featured",
      dataIndex: "featured",
      render: (val) => <Tag color={val ? "green" : "default"}>{val ? "Yes" : "No"}</Tag>,
    },
    {
      title: "Action",
      dataIndex: "id",
      render: (id) => (
        <Tooltip title="Approve">
          <Button icon={<CheckOutlined />} type="primary" onClick={() => handleApprove(id)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Pending Property Approvals</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="Search by title, owner or location"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={fetchPending}
          allowClear
          style={{ width: 250 }}
        />

       

       
        <Button type="primary" onClick={fetchPending}>
          Search
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={pendingProperties}
        loading={loading}
        rowKey={(record) => record.id}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: pagination?.total || 0,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default PendingPropertiesPage;
