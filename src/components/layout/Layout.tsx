import React, { ReactNode } from "react";
import { Layout as AntLayout } from "antd";
import { Navbar } from "./Navbar";

const { Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout>
      <Navbar />
      <Content className="expense-tracker-content">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>{children}</div>
      </Content>
    </AntLayout>
  );
};
