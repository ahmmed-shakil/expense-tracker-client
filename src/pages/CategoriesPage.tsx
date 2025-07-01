import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Tag,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { Layout } from "../components/layout";
import { api } from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

const { Title, Paragraph } = Typography;

interface Category {
  id: string;
  name: string;
  color: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      console.log("Categories API response:", response.data);
      setCategories(response.data.data || []);
    } catch (error: any) {
      handleApiError(error, "fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const categoryData = {
        name: values.name,
        color: values.color || "#1890ff",
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryData);
        toast.success("Category updated successfully!");
      } else {
        await api.post("/categories", categoryData);
        toast.success("Category created successfully!");
      }

      setModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error: any) {
      handleApiError(error, "save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      color: category.color,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted successfully!");
      fetchCategories();
    } catch (error: any) {
      handleApiError(error, "delete category");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string, record: Category) => (
        <Space>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: record.color,
              display: "inline-block",
            }}
          />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (color: string) => (
        <Tag color={color} style={{ color: "#fff", border: "none" }}>
          {color}
        </Tag>
      ),
    },
    {
      title: "Type",
      key: "type",
      width: 100,
      render: (record: Category) => (
        <Tag color={record.userId ? "blue" : "green"}>
          {record.userId ? "Custom" : "Default"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          {record.userId && (
            <Popconfirm
              title="Delete Category"
              description="Are you sure you want to delete this category?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2}>
            <FolderOutlined style={{ marginRight: "8px" }} />
            Categories
          </Title>
          <Paragraph>
            Manage your expense categories to better organize your spending.
          </Paragraph>

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCategory(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              Add Category
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCategories}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            scroll={{ x: 600 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <FolderOutlined
                    style={{ fontSize: "48px", color: "#d9d9d9" }}
                  />
                  <div
                    style={{
                      marginTop: "16px",
                      fontSize: "16px",
                      color: "#999",
                    }}
                  >
                    No categories found
                  </div>
                  <div style={{ marginTop: "8px", color: "#999" }}>
                    Start by adding your first category
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginTop: "16px" }}
                    onClick={() => {
                      setEditingCategory(null);
                      form.resetFields();
                      setModalOpen(true);
                    }}
                  >
                    Add Category
                  </Button>
                </div>
              ),
            }}
          />
        </Card>

        <Modal
          title={editingCategory ? "Edit Category" : "Add Category"}
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setEditingCategory(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Category Name"
              rules={[
                { required: true, message: "Please enter category name" },
                {
                  min: 2,
                  message: "Category name must be at least 2 characters",
                },
                {
                  max: 50,
                  message: "Category name must be less than 50 characters",
                },
              ]}
            >
              <Input placeholder="e.g., Food & Dining, Transportation" />
            </Form.Item>

            <Form.Item
              name="color"
              label="Color"
              initialValue="#1890ff"
              rules={[{ required: true, message: "Please select a color" }]}
            >
              <Input
                type="color"
                style={{ width: "100px", height: "40px", padding: "4px" }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    setEditingCategory(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};
