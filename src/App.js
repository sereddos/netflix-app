import React from "react";
import { Row, Col } from "reactstrap";
import "antd/dist/antd.css";
import { Table, DatePicker, Spin, Menu, Card, Layout, Statistic, } from "antd";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 PieChart, 
 Pie,
 Legend,
 Cell,
 Bar,
 Brush,
 BarChart
} from "recharts";
import moment from "moment";
import numeral from "numeral";
import { QueryRenderer } from "@cubejs-client/react";
import cubejs from "@cubejs-client/core";

// const API_URL = 'http://localhost:4000/cubejs-api/v1';
const API_URL = 'https://netflixapi-env.eba-3xpuprkq.us-east-2.elasticbeanstalk.com/cubejs-api/v1';
const CUBEJS_TOKEN = '6ad781833935efd8b7134e2e4e256cfb23ce1fca3de9034d642891d2b78a50f27d0e0d99e55c04233385a5d4c18e8a012349c5d0541c38d6b8da92aa9746e365';

const cubejsApi = cubejs(CUBEJS_TOKEN, {
 apiUrl: API_URL
});

const renderChart = (Component, options = {}) => ({ resultSet, error }) =>
  (resultSet && <Component resultSet={resultSet} {...options} />) ||
  (error && error.toString()) || <div style={{ textAlign: "center", paddingTop: 30 }}><Spin /> </div>;

const numberFormatter = item => numeral(item).format("0,0");
const dateFormatter = item => moment(item).format("MMM YY");

const AppLayout = ({ children }) => (
  <Layout>
    <Layout.Header>
      <Row type="flex" gutter={24} justify="space-between">
        <Col span={24} lg={6}>
          <h2 style={{ color: 'white', paddingTop: '10px' }}>
            Movies and TV Shows Listings on Netflix
          </h2>
        </Col>
        <Col span={24} lg={6}>
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ lineHeight: '64px', display: 'flex', justifyContent: 'flex-end' }}
          >
            <Menu.Item key="1">
              <a href="https://github.com/cube-js/cube.js">
                Github
              </a>
            </Menu.Item>
            <Menu.Item key="2">
              <a href="https://slack.cube.dev">
                Slack
              </a>
            </Menu.Item>
          </Menu>
        </Col>
      </Row>
      
    </Layout.Header>
    <Layout.Content
      style={{
        padding: "0 25px 25px 25px",
        margin: "25px"
      }}
    >
      {children}
    </Layout.Content>
  </Layout>
);

const Dashboard = ({ children, onDateRangeChange }) => [
  <Row
    type="flex"
    justify="space-around"
    align="top"
    gutter={24}
    style={{
      marginBottom: 20
    }}
  >
    <Col span={24} lg={12} align="right">
      <DatePicker.RangePicker
        onChange={(date, dateString) => onDateRangeChange(dateString)}
        defaultValue={[
          moment("2008/01/01", "YYYY/MM/DD"),
          moment("2020/01/31", "YYYY/MM/DD")
        ]}
      />
    </Col>
  </Row>,
  <Row type="flex" justify="space-around" align="top" gutter={24}>
    {children}
  </Row>
];

const DashboardItem = ({ children, title, size, height }) => (
  <Col span={24} lg={size}>
    <Card
      title={title}
      style={{
        marginBottom: "24px"
      }}
    >
      <div style={{height: height}}>
        {children}
      </div>
    </Card>
  </Col>
);

DashboardItem.defaultProps = {
  size: 12
};

const numberRender = ({ resultSet }) => (
  <Row
    type="flex"
    justify="center"
    align="middle"
    style={{
      width: "100%"
    }}
  >
    <Col>
      {resultSet.seriesNames().map(s => (
        <Statistic value={resultSet.totalRow()[s.key]} />
      ))}
    </Col>
  </Row>
);

const colorsProduced = ["#7DB3FF", "#49457B", "#FF7C78", "#FED3D0"];
const colorsGenres = ["#0088FE", "#00C49F", "#8884d8", "#83a6ed", "#8dd1e1", "#FFBB28", "#FF8042"];
const colorsRating = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658"];
const pieRender = ({ resultSet, dataKey, colors }) => (
  <ResponsiveContainer width="100%" height={350}>
    <PieChart>
      <Pie
        data={resultSet.chartPivot()}
        nameKey="category"
        dataKey={dataKey}
        label
      >
        {resultSet.chartPivot().map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Legend verticalAlign="middle" align="right" layout="vertical" />
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

const areaRender = ({ resultSet, dataKey }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={resultSet.chartPivot()}>
      <XAxis dataKey="category" tickFormatter={dateFormatter} />
      <YAxis tickFormatter={numberFormatter} />
      <Tooltip labelFormatter={dateFormatter} />
      <Area
        type="monotone"
        dataKey={dataKey}
        name="Total Shows"
        stroke="rgb(106, 110, 229)"
        fill="rgba(106, 110, 229, .16)"
      />
      <Brush dataKey="name" height={30} stroke="#8884d8" />
    </AreaChart>
  </ResponsiveContainer>
);

const barRender = ({ resultSet, dataKey }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={resultSet.chartPivot()}>
      <XAxis tickFormatter={dateFormatter} dataKey="x" />
      <YAxis tickFormatter={numberFormatter} />
      <Bar
        stackId="a"
        dataKey="Movie, Netflix.count"
        name="Movies"
        fill="#7DB3FF"
      />
      <Bar
        stackId="a"
        dataKey="TV Show, Netflix.count"
        name="TV Shows"
        fill="#49457B"
      />
      <Legend />
      <Brush dataKey="name" height={30} stroke="#8884d8" />
      <Tooltip labelFormatter={dateFormatter} />
    </BarChart>
  </ResponsiveContainer>
);

const tableRender = ({ resultSet }) => (
  <ResponsiveContainer width="100%">
    <Table
      pagination={false}
      columns={resultSet.tableColumns().map(c => ({ ...c, dataIndex: c.key }))}
      dataSource={resultSet.tablePivot()}
    />
  </ResponsiveContainer>
);

class App extends React.Component {  
  constructor(props) {
    super(props);
    this.state = {
      cubePostFix: "",
      dateRange: ["2008-01-01", "2020-01-31"]
    };
  }
  render() {
    return (
      <AppLayout>
        <Dashboard
          onDateRangeChange={dateRange =>
            this.setState({
              dateRange: dateRange
            })
          }
        >
            <DashboardItem title="Total Netflix Shows" size={4}>
              <QueryRenderer
                query={{
                  measures: [`Netflix${this.state.cubePostFix}.totalCount`],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange
                    }
                  ]
                }}
                cubejsApi={cubejsApi}
                render={renderChart(numberRender)}
              />
            </DashboardItem>
            <DashboardItem title="Netflix TV Shows" size={4}>
              <QueryRenderer
                query={{
                  measures: [`Netflix${this.state.cubePostFix}.tvShowCount`],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange
                    }
                  ]
                }}
                cubejsApi={cubejsApi}
                render={renderChart(numberRender)}
              />
            </DashboardItem>
            <DashboardItem title="Netflix Movies" size={4}>
              <QueryRenderer
                query={{
                  measures: [`Netflix${this.state.cubePostFix}.movieCount`],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange
                    }
                  ]
                }}
                cubejsApi={cubejsApi}
                render={renderChart(numberRender)}
              />
            </DashboardItem>
            <DashboardItem title="Top 15 countries where Netflix movies/shows were produced" size={6}>
              <QueryRenderer
                query={{
                  measures: [`Netflix${this.state.cubePostFix}.totalCount`],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange,
                    }
                  ],
                  dimensions: [`Netflix${this.state.cubePostFix}.country`],
                  filters: [
                    {
                      member: `Netflix${this.state.cubePostFix}.country`,
                      operator: `set`
                    }
                  ],
                  order: {
                    'Netflix.totalCount': 'desc'
                  },
                  limit: 15
                }}
                cubejsApi={cubejsApi}
                render={renderChart(pieRender, {dataKey: 'Netflix.totalCount', colors: colorsProduced})}
              />
            </DashboardItem>
            <DashboardItem title="Top 15 Netflix genres" size={6}>
              <QueryRenderer
                query={{
                  measures: [`Netflix${this.state.cubePostFix}.totalCount`],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange,
                    }
                  ],
                  dimensions: [`Netflix${this.state.cubePostFix}.listedIn`],
                  filters: [
                    {
                      member: `Netflix${this.state.cubePostFix}.listedIn`,
                      operator: `set`
                    }
                  ],
                  order: {
                    'Netflix.totalCount': 'desc'
                  },
                  limit: 15
                }}
                cubejsApi={cubejsApi}
                render={renderChart(pieRender, {dataKey: 'Netflix.totalCount', colors: colorsGenres})}
              />
            </DashboardItem>
            <DashboardItem title="Top 5 countries where Netflix movies/shows were produced (details)" size={6}>
              <QueryRenderer
                query={{
                  measures: [
                    `Netflix${this.state.cubePostFix}.totalCount`,
                    `Netflix${this.state.cubePostFix}.movieCount`,
                    `Netflix${this.state.cubePostFix}.tvShowCount`
                  ],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange,
                    }
                  ],
                  dimensions: [`Netflix${this.state.cubePostFix}.country`],
                  filters: [
                    {
                      member: `Netflix${this.state.cubePostFix}.country`,
                      operator: `set`
                    }
                  ],
                  order: {
                    'Netflix.totalCount': 'desc'
                  },
                  limit: 5
                }}
                cubejsApi={cubejsApi}
                render={renderChart(tableRender)}
              />
            </DashboardItem>
            <DashboardItem title="Netflix TV Rating of the movie/show" size={6}>
              <QueryRenderer
                query={{
                  measures: [`Netflix${this.state.cubePostFix}.totalCount`],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange,
                    }
                  ],
                  dimensions: [`Netflix${this.state.cubePostFix}.rating`],
                  filters: [
                    {
                      member: `Netflix${this.state.cubePostFix}.rating`,
                      operator: `set`
                    }
                  ],
                  order: {
                    'Netflix.totalCount': 'desc'
                  },
                  limit: 15
                }}
                cubejsApi={cubejsApi}
                render={renderChart(pieRender, {dataKey: 'Netflix.totalCount', colors: colorsRating})}
              />
            </DashboardItem>
            <DashboardItem title="Netflix Shows Timeline" size={12}>
              <QueryRenderer
                query={{
                  measures: [`Netflix${this.state.cubePostFix}.totalCount`],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange,
                      granularity: "month"
                    }
                  ]
                }}
                cubejsApi={cubejsApi}
                render={renderChart(areaRender, {dataKey: 'Netflix.totalCount'})}
              />
            </DashboardItem>
            <DashboardItem title="Netflix Shows by Type Timeline" size={12}>
              <QueryRenderer
                query={{
                  measures: [`Netflix${this.state.cubePostFix}.count`],
                  dimensions: [`Netflix${this.state.cubePostFix}.showType`],
                  timeDimensions: [
                    {
                      dimension: `Netflix${this.state.cubePostFix}.dateAdded`,
                      dateRange: this.state.dateRange,
                      granularity: "month"
                    }
                  ]
                }}
                cubejsApi={cubejsApi}
                render={renderChart(barRender, {dataKey: 'Netflix.count'})}
              />
            </DashboardItem>
        </Dashboard>
      </AppLayout>
    );
  }
 }
 
 export default App;