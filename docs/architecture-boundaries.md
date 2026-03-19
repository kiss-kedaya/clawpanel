# Architecture Boundaries

## 目标
明确 ClawPanel 前端页面层、业务规则层、接口适配层、后端桥接层的职责边界，减少页面直接耦合底层实现。

## 边界规则

### 1. 页面层（`src/pages/*`）
页面层负责：
- 页面装配
- DOM 绑定
- 交互流程编排
- 调用 service / domain / adapter

页面层不应负责：
- 解释原始后端 DTO 细节
- 维护大量可复用纯业务规则
- 同时承担 UI + persistence + transport + parsing

### 2. 业务规则层（`src/lib/*`，后续建议细分为 domain/）
业务规则层负责：
- 常量
- 状态枚举
- 纯函数
- 提示词模板
- 数据解析与格式化
- 可复用 view-model 规则

当前已落地案例：
- `src/lib/hosted-agent.js`
  - hosted status
  - hosted defaults/runtime defaults
  - hosted fixed prompt
  - hosted response parse / instruction extract / ask_user extract
  - hosted action label formatting

### 3. 接口适配层（后续建议 `src/lib/adapters/`）
适配层负责：
- Tauri / Gateway / dev-api 返回结构转换
- 原始 payload -> 页面 view-model
- 消息、会话、状态、服务信息的统一映射

原则：
- 页面只消费稳定字段
- 原始后端字段变动尽量只影响 adapter

### 4. transport / API 层（`src/lib/tauri-api.js`）
API 层负责：
- 命令发送
- 缓存
- 超时控制
- 统一错误包装

不建议继续扩张为：
- 页面业务判断中心
- DTO 转换中心
- 交互状态管理中心

### 5. Web bridge / headless 后端（`scripts/dev-api.js`）
当前问题：
- route middleware、配置读写、命令逻辑、系统调用混在单文件

后续建议：
- route dispatch
- config helpers
- command handlers
- instance / service / backup / auth handlers
分批拆分，避免一次性大重构。

## 当前优先治理对象
1. `src/pages/chat.js`
2. `src/pages/assistant.js`
3. `src/lib/tauri-api.js`
4. `scripts/dev-api.js`

## 代码治理原则
- 页面只做页面的事
- transport 不做页面判断
- adapter 负责后端结构收口
- domain 负责规则与状态转换
- 能删复杂逻辑就不保留高维护成本实现
- 先抽纯函数和常量，再抽 service，避免过度抽象
