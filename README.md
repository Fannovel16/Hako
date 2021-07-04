# Hako

> A RESTful API package for Light Novel Portal Hako (ln.hako.re/docln.net)

> Một RESTful API package dành cho cổng Light Novel Hako (ln.hako.re/docln.net)

**⚠️⚠️ This package can only run Node.js version 14.0.0+ due to [private class methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) ⚠️⚠️**

## Table of Contents  
* [What is Hako/Hako là gì?](#hako-introduction) <br/>
* [Getting Started](#start) <br/>
* [Class Hako](#hako-class) <br/>
  * [new Hako(name, password)](#new-hako) <br/>


## What is Hako? (Hako là gì?)
<a name="hako-introduction"></a>
> Light Novel Portal (formerly known as BBS Hako) is a portal specializing in Light Novels launched in 2013 under the cooperation of Hako and Sonako Light Novel Wiki, the site works with the following criteria and purposes:
> * Collection of all Vietnamese Light Novel translations available online.
> * Facilitate Light Novel translation teams to share, promote and discuss their work.
> * Helping readers access Light Novels intuitively through a specialized online reading system.
>
> Factors that make Light Novel Portal superior to other Light Novel sharing services:
> * At LNP, speed comes first, the site uses its own server and has the ability to store all data, helping to access and display images faster with the best quality.
> * The online reading interface is optimized with the function of increasing font size and line spacing, along with a bookmark system for users.
> * LNP supports users to post translations with a quick and efficient set of tools.
> * Support online reading on handheld devices and mobile phones.

> Cổng Light Novel (từng được gọi với cái tên BBS Hako) là một cổng thông tin chuyên về Light Novel ra đời từ năm 2013 dưới sự cộng tác của Hako và Sonako Light Novel Wiki, trang hoạt động với các tiêu chí và mục đích sau đây:
> * Tập hợp toàn bộ bản dịch Light Novel Tiếng Việt có trên mạng.
> * Tạo điều kiện cho các nhóm dịch Light Novel chia sẻ, quảng bá và thảo luận thành quả của họ.
> * Giúp người đọc tiếp cận với Light Novel một cách trực quan thông qua hệ thống đọc online chuyên biệt.
>
> Những yếu tố giúp Cổng Light Novel ưu việt hơn những dịch vụ chia sẻ Light Novel khác:
> * Ở CLN, tốc độ được đặt lên trên hết, trang sử dụng server riêng và có khả năng lưu trữ toàn bộ dữ liệu, giúp cho việc truy cập và hiển thị ảnh nhanh hơn với chất lượng tốt nhất.
> * Giao diện đọc online được tối ưu hóa với chức năng tăng size font và giãn cách line, cùng với hệ thống bookmark cho người dùng.
> * CLN hỗ trợ người dùng đăng bản dịch với bộ công cụ nhanh và hiệu quả.
> * Hỗ trợ đọc online trên thiết bị cầm tay và điện thoại di động.

## Getting Started
<a name="start"></a>
I don't have plan to upload this project on NPM yet, so cloning the repo on GitHub is the only way. <br/>
Tôi chưa dự định đăng cái này lên NPM nên cách duy nhất để cài là clone repo.
```
git clone https://github.com/Hacker17082006/Hako.git
```

**Example/Ví dụ**
```
const hako = new Hako(process.env.NAME, process.env.PASSWORD)
await hako.login()
const {translation: trans_series} = await hako.get_series()
await trans_series[0].volumes[0].create_chapter({
    title: "A example chapter",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
})
```

## Class Hako
<a name="hako-class"></a>
Your start point. Each Hako object represent a Hako account and it functionality. <br/>
Điểm khởi đầu của bạn. Mỗi object Hako tượng trưng cho một tài khoản Hako và các chức năng của nó.

### new Hako(name, password)
<a name="new-hako"></a>
Create a Hako object with name and password. <br/>
Tạo một object Hako 
```
new Hako(process.env.NAME, process.env.PASSWORD)
```