import { PortalContainer, Toaster } from "@keybr/widget";
import { type ReactNode } from "react";
import { NavMenu } from "./NavMenu.tsx";
import { SubMenu } from "./SubMenu.tsx";
import * as styles from "./Template.module.less";

export function Template({
  path,
  children,
}: {
  readonly path: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={styles.bodyAlt}>
      <nav className={styles.navAlt}>
        <NavMenu currentPath={path} />
      </nav>
      <main className={styles.mainAlt}>
        {children}
        <PortalContainer />
        <Toaster />
      </main>
      <footer className={styles.footer}>
        <SubMenu currentPath={path} />
      </footer>
      <EnvName />
    </div>
  );
}

function EnvName() {
  return process.env.NODE_ENV === "production" ? null : (
    <div
      style={{
        position: "fixed",
        zIndex: "1",
        insetInlineEnd: "0px",
        insetBlockEnd: "0px",
        padding: "5px",
        margin: "5px",
        border: "1px solid red",
        color: "red",
      }}
    >
      {`process.env.NODE_ENV=${process.env.NODE_ENV}`}
    </div>
  );
}