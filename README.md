# Screen Friend - RPG学習支援アシスタント

## 概要
Screen Friendは、IBM i (AS/400) のRPG言語学習を支援するデスクトップアプリケーションです。5250ターミナルエミュレータの画面を自動的に監視し、AIを活用してリアルタイムで操作ガイダンスを提供します。

## 主な機能
- 5250ターミナル画面の自動キャプチャ
- OCRによる画面内容の認識
- AI（Claude/GPT等）による操作アドバイスの生成
- 画面変化の自動検出と即座のフィードバック
- 学習履歴の保存

## 動作環境
- Windows 10/11（主要ターゲット）
- macOS（開発・検証用）
- Node.js 18以上
- IBM i Access for Windows（または互換5250エミュレータ）

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd screen-friend
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境設定
```bash
cp .env.example .env
```
`.env`ファイルを編集し、以下の設定を行います：
- `OPENAI_API_KEY`: OpenAI APIキー（GPT使用時）
- `ANTHROPIC_API_KEY`: Anthropic APIキー（Claude使用時）

### 4. 開発モードで起動
```bash
npm run dev
```

### 5. ビルド（本番用）
```bash
# Windows用
npm run build:win

# macOS用
npm run build:mac
```

## 使用方法

### 初回設定
1. アプリケーションを起動
2. 設定画面で5250ターミナルウィンドウの位置を指定
3. AIプロバイダー（Claude/GPT）を選択
4. 必要に応じてAPIキーを設定

### 基本的な使い方
1. 5250ターミナルを指定した位置に配置
2. Screen Friendが自動的に画面を監視開始
3. ターミナル操作を行うと、右側のアシスタント画面に次の操作指示が表示
4. 指示に従って学習を進める

### ショートカットキー
- `Ctrl+Shift+S`: 監視の開始/停止
- `Ctrl+Shift+C`: 現在の画面を手動キャプチャ
- `Ctrl+Shift+H`: 履歴の表示

## トラブルシューティング

### 画面が認識されない場合
- ターミナルウィンドウが指定位置に正しく配置されているか確認
- OCR精度設定を調整（設定画面から）

### APIエラーが発生する場合
- APIキーが正しく設定されているか確認
- ネットワーク接続を確認