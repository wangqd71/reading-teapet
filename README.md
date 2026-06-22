# 阅读茶宠

一边看 TXT 小说，一边玩 RPG 冒险游戏。

打开任意 TXT 文件，书中的文字会触发随机遭遇、战斗和奖励，让阅读变成一场冒险。

## 功能

| 功能 | 说明 |
|------|------|
| 📖 TXT 加载 | 拖拽/选择文件，自动 UTF-8/GBK 编码检测 |
| 📄 分页阅读 | 单栏/双栏布局，字体/行距可调，进度自动保存 |
| 🔖 书签 | 随时添加书签，快速跳转 |
| 🗡️ 角色创建 | 战士/法师/刺客/牧师四大职业，属性自由分配 |
| ⚔️ 回合制战斗 | 翻页随机触发遭遇，暴击/闪避/技能/道具 |
| 🐉 Boss 挑战 | 手动触发 Boss 战 |
| 🧪 物品系统 | 掉落拾取、背包管理、装备穿戴、药水使用 |
| 💾 本地存档 | 角色/背包/阅读进度全部存储在浏览器 localStorage |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 浏览器打开
http://localhost:5173
```

## 构建部署

```bash
# 生产构建
npm run build

# 预览构建结果
npm run preview
```

构建产物在 `dist/` 目录，可直接部署到任意静态服务器。

## 使用方式

1. 启动后输入角色名，选择职业
2. 点击「开始冒险」进入阅读界面
3. 拖拽或点击选择一个 TXT 文件
4. 阅读过程中翻页会随机触发战斗
5. 战斗胜利获得经验、金币和掉落物品
6. 右上角可手动触发 Boss 战
7. 左侧可展开角色面板查看属性/装备/背包

## 快捷键

| 按键 | 功能 |
|------|------|
| `→` / `↓` / `Space` | 下一页 |
| `←` / `↑` | 上一页 |

## 项目结构

```
src/
├── App.vue                    # 主布局
├── main.js                    # 入口
├── components/
│   ├── FileLoader.vue         # 文件加载
│   ├── Reader.vue             # 阅读区域
│   ├── CharacterPanel.vue     # 角色面板
│   ├── CharacterCreate.vue    # 角色创建
│   ├── BattleSystem.vue       # 战斗系统
│   ├── Inventory.vue          # 背包
│   └── StatusBar.vue          # 底部状态栏
├── stores/
│   ├── character.js           # 角色状态
│   ├── game.js                # 游戏状态
│   └── reader.js              # 阅读状态
├── data/
│   ├── classes.js             # 职业数据
│   ├── monsters.js            # 怪物数据
│   └── items.js               # 物品数据
└── utils/
    ├── fileReader.js          # 文件读取/编码检测/分页
    └── combat.js              # 战斗逻辑
```

## 技术栈

- Vue 3 (Composition API)
- Pinia 状态管理
- Vite 构建工具
- localStorage 本地持久化

## License

MIT
