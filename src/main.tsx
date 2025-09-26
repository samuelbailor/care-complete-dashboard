import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import App from "./App.tsx";
import "./index.css";

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    colorBgContainer: '#ffffff',
  },
};

createRoot(document.getElementById("root")!).render(
  <ConfigProvider theme={theme}>
    <App />
  </ConfigProvider>
);