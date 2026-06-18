import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PropTypes from "prop-types";

export default function PageLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 font-dm overflow-hidden">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 font-sora tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
