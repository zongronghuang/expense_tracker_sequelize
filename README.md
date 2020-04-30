# 老爸的私房錢
---
老爸的私房錢 (Alpha Camp 學期三期末考迷你專案)[<sup>1</sup>](#1)

此專案採用 MySQL 作為後端資料庫。

![Demo](/Demo.png)


## 建立 MySQL 環境
1. 必須先在個人電腦上安裝及執行 MySQL 資料庫。MySQL 資料庫負責記錄支出項目的資料。

## 安裝專案及相依套件
---
若要執行此專案，請在 console 內執行下列步驟：

1. 從 GitHub 下載此專案：
```
git clone https://github.com/zongronghuang/expense_tracker_sequelize.git expense_tracker_sequelize
``` 
2. 前往 **expense_tracker_sequelize** 資料夾。

3. 透過 console 安裝下列相依套件：
```
    npm install bycrptjs
                body-parser 
                connect-flash 
                dotenv
                express 
                express-handlebars 
                express-session
                method-override 
                mysql2
                passport 
                passport-facebook
                passport-local  
                sequelize
                sequelize-cli
```

4. 啟動本地伺服器：
```
    npm run start
```

5. 開啟網路瀏覽器並輸入下列網址：
```
    localhost:3000
```

6. 現在您已可以開始使用此專案。

## 功能
---

### 登入
* 本地登入：在本地端註冊後，即可利用註冊的帳號密碼登入使用。
* Facebook 登入：使用 Facebook 帳號登入。(需自行提供 .env 檔案，在裡面提供 Facebook app 需要的相關資訊才可執行。)

### 顯示支出項目
* 進入首頁後，顯示從開始使用到目前累積的**支出總金額**，還有當月的所有支出項目。支出項目包含下列資訊：
    * 分類
    * 名稱
    * 時間
    * 金額

### 篩選支出項目
* 按一下購物類別及月份清單，即可顯示符合此範圍的支出。
    * 選擇全部類別：顯示當月的所有支出項目及**當月累積支出**。
    * 選擇特定類別：顯示當月同一類別的支出項目、**類別小計**和**該類別金額佔當月金額的比例**。

### 新增支出項目
* 按一下**新增支出**即可前往建立新的支出項目。

### 編輯及刪除支出項目
* 按一下**編輯**或**刪除**，即可編輯或刪除支出項目。

---
<a class="anchor" id="1">1</a>: 此專案及所有內容皆作為學習用途，並無侵犯著作權之意圖。