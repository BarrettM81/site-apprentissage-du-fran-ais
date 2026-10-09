# 法语动词每日刷题

一个可安装到 iPhone 主屏幕的法语动词练习网站。练习记录保存在当前设备浏览器的 IndexedDB 中，不需要注册账号，也不会自动上传或同步。

## 在线预览

打开网站：<https://barrettm81.github.io/site-apprentissage-du-fran-ais/>

页面由 GitHub Pages 托管，使用 HTTPS。每次更新推送到 `main` 后，GitHub Actions 会自动重新发布。

## 在 iPhone 上使用

### 添加到主屏幕

1. 在 iPhone 上用 **Safari** 打开上面的预览链接。
2. 第一次打开时保持联网，等待练习页面加载完成。
3. 点 Safari 的「分享」按钮，选择「添加到主屏幕」。
4. 按需开启「作为网页 App 打开」，然后点「添加」。
5. 之后可以从主屏幕图标打开网站。首次加载完成后再刷新一次，让离线缓存安装好。

在网站已经成功加载并完成缓存后，可以尝试断网打开。学习进度保存在这台 iPhone 上的 IndexedDB 中；换浏览器或设备不会自动同步。清除 Safari 网站数据可能会删除记录，请定期使用页面里的「导出学习记录」备份。

### 从电脑在本地网络打开

如果想让 iPhone 直接访问电脑上的项目文件，而不是在线预览：

1. 让电脑和 iPhone 连接同一个 Wi-Fi。
2. 在电脑上进入本项目目录，运行静态文件服务器：

   ```bash
   python3 -m http.server 8000 --bind 0.0.0.0
   ```

3. 查询电脑在局域网中的 IP 地址。Ubuntu 可运行 `hostname -I`；macOS 可运行 `ipconfig getifaddr en0`；Windows 可运行 `ipconfig` 并查看无线网卡的 IPv4 地址。
4. 在 iPhone 的 Safari 地址栏输入 `http://电脑的IP地址:8000/`，例如 `http://192.168.1.20:8000/`。
5. 使用期间不要关闭电脑上的服务器进程。若无法访问，请检查电脑防火墙是否允许端口 `8000`。

不要在 iPhone 上直接通过「文件」预览 HTML 文件：本地文件预览不一定会执行网页脚本，也不能可靠地保存 IndexedDB 学习记录。请使用上面的 HTTPS 预览，或通过同一 Wi-Fi 下的电脑服务器访问。

## 本地检查

在项目根目录启动预览服务器：

```bash
python3 -m http.server 8000
```

然后在浏览器打开 <http://localhost:8000/>。此方式适合在本机检查页面。

## 发布到 GitHub Pages

仓库已配置 GitHub Actions 自动部署；首次运行会尝试自动启用 Pages。若 GitHub 因仓库权限或组织策略未能自动启用，请在仓库设置中选择：

**Settings → Pages → Build and deployment → Source → GitHub Actions**

推送到 `main` 会自动触发发布；也可以在 **Actions → Deploy to GitHub Pages → Run workflow** 手动触发。部署成功后使用上方的在线预览链接。

## 学习记录数据库

- 数据库：`francais-apprentissage`
- 对象仓库：`progress`
- 学习记录键：`learning-state`
- 数据只保存在当前网站来源下的本机浏览器中；导入、导出功能可用于备份和迁移。
