import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Card, Row, Col, Spin } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchFranchiseeStatistics } from "../../redux/slices/franchiseeSlice";
import PendingFranchisees from "./PendingFranchisees";
import ActiveFranchisees from "./ActiveFranchisees";

const { TabPane } = Tabs;

const FranchiseeManagement = () => {
  const dispatch = useDispatch();
  const { statistics, totalElements, loading, error } = useSelector((state) => state.franchisee);

  useEffect(() => {
    dispatch(fetchFranchiseeStatistics());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 font-inter md:p-6 p-2">
      <Spin spinning={loading}>
        {/* ✅ Header */}
        <header className="bg-cyan-800 text-white p-4 rounded-lg shadow-lg mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-center md:text-left">
            Franchisee Management
          </h1>
        </header>

        {/* ✅ Top Summary Cards */}
        <Row gutter={[12, 12]} className="md:mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card
              title="Pending"
              bordered={false}
              className="bg-yellow-100 rounded-xl shadow-md text-center"
            >
              <p className="text-lg font-semibold text-gray-800">
                {statistics.PENDING || 0}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              title="Approved"
              bordered={false}
              className="bg-green-100 rounded-xl shadow-md text-center"
            >
              <p className="text-lg font-semibold text-gray-800">
                {statistics.APPROVED || 0}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              title="Rejected"
              bordered={false}
              className="bg-red-100 rounded-xl shadow-md text-center"
            >
              <p className="text-lg font-semibold text-gray-800">
                {statistics.REJECTED || 0}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              title="Terminated"
              bordered={false}
              className="bg-gray-200 rounded-xl shadow-md text-center"
            >
              <p className="text-lg font-semibold text-gray-800">
                {statistics.TERMINATED || 0}
              </p>
            </Card>
          </Col>
        </Row>


        {/* ✅ Tabs for Pending & Active */}
        <Tabs defaultActiveKey="pending">
          <TabPane tab="Pending Requests" key="pending">
            <PendingFranchisees />
          </TabPane>
          <TabPane tab="Active Franchisees" key="active">
            <ActiveFranchisees />
          </TabPane>
        </Tabs>

        <ToastContainer position="top-right" autoClose={3000} />
      </Spin>
    </div>
  );
};

export default FranchiseeManagement;
