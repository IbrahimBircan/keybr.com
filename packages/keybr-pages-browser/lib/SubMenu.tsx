import { Pages } from "@keybr/pages-shared";
import { Link as StaticLink } from "@keybr/widget";
import { useIntl } from "react-intl";
import { Link as RouterLink } from "react-router";
import * as styles from "./SubMenu.module.less";

export function SubMenu({ currentPath }: { readonly currentPath: string }) {
  const { formatMessage } = useIntl();
  return (
    <div className={styles.root}>
      <StaticLink href="mailto:info@keybr.com" target="email">
        info@keybr.com
      </StaticLink>
      <RouterLink to={Pages.termsOfService.path}>
        {formatMessage(Pages.termsOfService.link.label)}
      </RouterLink>
      <RouterLink to={Pages.privacyPolicy.path}>
        {formatMessage(Pages.privacyPolicy.link.label)}
      </RouterLink>
      <StaticLink href="https://github.com/aradzie/keybr.com" target="github">
        GitHub (Kaynak Kod)
      </StaticLink>
    </div>
  );
}