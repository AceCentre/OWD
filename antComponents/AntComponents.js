import dynamic from "next/dynamic";

export const AntComponents = {
    Button: dynamic(() => import("antd").then((mod) => mod.Button), {
        ssr: false,
    }),
    Card: dynamic(() => import("antd").then((mod) => mod.Card), { ssr: false }),
    Checkbox: dynamic(() => import("antd").then((mod) => mod.Checkbox), {
        ssr: false,
    }),
    Col: dynamic(() => import("antd").then((mod) => mod.Col), { ssr: false }),
    Content: dynamic(() => import("antd").then((mod) => mod.Layout.Content), {
        ssr: false,
    }),
    CopyOutlined: dynamic(() => import("@ant-design/icons").then((mod) => mod.CopyOutlined), {
        ssr: false,
    }),
    Flex: dynamic(() => import("antd").then((mod) => mod.Flex), { ssr: false }),
    Footer: dynamic(() => import("antd").then((mod) => mod.Layout.Footer), {
        ssr: false,
    }),
    Form: dynamic(() => import("antd").then((mod) => mod.Form), { ssr: false }),
    Header: dynamic(() => import("antd").then((mod) => mod.Layout.Header), {
        ssr: false,
    }),
    Input: dynamic(() => import("antd").then((mod) => mod.Input), {
        ssr: false,
    }),
    InputNumber: dynamic(() => import("antd").then((mod) => mod.InputNumber), {
        ssr: false,
    }),
    Item: dynamic(() => import("antd").then((mod) => mod.Form.Item), {
        ssr: false,
    }),
    Layout: dynamic(() => import("antd").then((mod) => mod.Layout), {
        ssr: false,
    }),
    Modal: dynamic(() => import("antd").then((mod) => mod.Modal), {
        ssr: false,
    }),
    Option: dynamic(() => import("antd").then((mod) => mod.Select.Option), {
        ssr: false,
    }),
    Paragraph: dynamic(
        () => import("antd").then((mod) => mod.Typography.Paragraph),
        { ssr: false }
    ),
    Row: dynamic(() => import("antd").then((mod) => mod.Row), { ssr: false }),
    Select: dynamic(async () => {
        const mod = await import("antd");
        const SelectComponent = mod.Select;
        SelectComponent.Option = mod.Select.Option;
        return SelectComponent;
    }, { ssr: false }),
    Tabs: dynamic(() => import("antd").then((mod) => mod.Tabs), {
        ssr: false,
    }),
    TabPane: dynamic(() => import("antd").then((mod) => mod.Tabs.TabPane), {
        ssr: false,
    }),
    Text: dynamic(() => import("antd").then((mod) => mod.Typography.Text), {
        ssr: false,
    }),
    Title: dynamic(() => import("antd").then((mod) => mod.Typography.Title), {
        ssr: false,
    }),
};
