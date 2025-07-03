// utils/emailTemplates.ts

import Admin from '../models/admin';
import Applicant from '../models/applicant';
import AuctionProduct from '../models/auctionproduct';
import Job from '../models/job';
import OrderItem from '../models/orderitem';
import Order from '../models/order';
import User from '../models/user';

export const emailTemplates = {
  verifyEmail: (user: User, code: string): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${process.env.APP_NAME}</title>
    <style>
    * { 
        margin:0;
        padding:0;
        font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
        font-size: 100%;
        line-height: 1.6;
    }
    
    img { 
        max-width: 100%; 
    }
    
    body {
        -webkit-font-smoothing:antialiased; 
        -webkit-text-size-adjust:none; 
        width: 100%!important; 
        height: 100%;
    }
    
    a { 
        color: #348eda;
    }
    
    .btn-primary{
        text-decoration:none;
        color: #FFF;
        background-color: #348eda;
        border:solid #348eda;
        border-width:10px 20px;
        line-height:2;
        font-weight:bold;
        margin-right:10px;
        text-align:center;
        cursor:pointer;
        display: inline-block;
        border-radius: 25px;
    }
    
    .btn-secondary {
        text-decoration:none;
        color: #FFF;
        background-color: #aaa;
        border:solid #aaa;
        border-width:10px 20px;
        line-height:2;
        font-weight:bold;
        margin-right:10px;
        text-align:center;
        cursor:pointer;
        display: inline-block;
        border-radius: 25px;
    }
    
    .last { 
        margin-bottom: 0;
    }
    
    .first{
        margin-top: 0;
    }
    
    .padding{
        padding:10px 0;
    }
    
    table.body-wrap { 
        width: 100%;
        padding: 20px;
    }
    
    table.body-wrap .container{
        border: 1px solid #f0f0f0;
    }
    
    table.footer-wrap { 
        width: 100%;	
        clear:both!important;
    }
    
    .footer-wrap .container p {
        font-size:12px;
        color:#666;
    }
    
    table.footer-wrap a{
        color: #999;
    }
    
    h1,h2,h3{
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
        line-height: 1.1; 
        margin-bottom:15px; 
        color:#000;
        margin: 40px 0 10px;
        line-height: 1.2;
        font-weight:200; 
    }
    
    h1 {
        font-size: 36px;
    }
    h2 {
        font-size: 28px;
        text-align:center;
    }
    h3 {
        font-size: 22px;
    }
    
    p, ul, ol { 
        margin-bottom: 10px; 
        font-weight: normal; 
        font-size:15px;
    }
    
    ul li, ol li {
        margin-left:5px;
        list-style-position: inside;
    }
    
    strong{
        font-size:18px;
        font-weight:normal;
    }
    
    .container {
        display:block!important;
        max-width:600px!important;
        margin:0 auto!important; 
        clear:both!important;
    }
    
    .body-wrap .container{
        padding:20px;
    }
    
    .content {
        max-width:600px;
        margin:0 auto;
        display:block; 
    }
    
    .content table { 
        width: 100%; 
    }
    
    .center{
        text-align:center;
    }
    
    .left{
        text-align:left;
    }
    
    .logo{
        display:inline-block;
        width:399px;
        height:85px;
        max-width:90%;
    }
    
    .footnote{
        font-size:14px;
        color:#444;
    }
    
    @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
        .logo{
            background-image:url(chartblocks@2x.png);
            background-size:100% auto;
            background-repeat:no-repeat;
        }
        .logo img{
            visibility:hidden;
        }
    }
    
    </style>
    </head>
    
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                <table>
                    <tr>
                        <td class="center">
                            <div class="logo">
                                <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h2>Activate your account</h2>
                            <p>Hi ${user.firstName} ${user.lastName},</p>
                            <p>Thank you for creating an account on ${process.env.APP_NAME}. To complete the registration and use ${user.email} to log in, please verify your email by using the code below:</p>
                            <table>
                                <tr>
                                    <td class="padding left">
                                        <p><strong>${code}</strong></p>
                                    </td>
                                </tr>
                            </table>
                            <p>This code is valid for one hour from the time this message was sent.</p>
                            <p>Thank you,<br> The ${process.env.APP_NAME} Support Team.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p class="footnote">If you encounter any issues, please contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> and we will assist you as soon as possible.</p>
                        </td>
                    </tr>
                </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                <script>
                    document.write(new Date().getFullYear())
                    </script> © <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    
      `;
  },

  forgotPassword: (user: User, code: string): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${process.env.APP_NAME}</title>
    <style>
    * { 
        margin:0;
        padding:0;
        font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
        font-size: 100%;
        line-height: 1.6;
    }
    
    img { 
        max-width: 100%; 
    }
    
    body {
        -webkit-font-smoothing:antialiased; 
        -webkit-text-size-adjust:none; 
        width: 100%!important; 
        height: 100%;
    }
    
    a { 
        color: #348eda;
    }
    
    .btn-primary{
        text-decoration:none;
        color: #FFF;
        background-color: #348eda;
        border:solid #348eda;
        border-width:10px 20px;
        line-height:2;
        font-weight:bold;
        margin-right:10px;
        text-align:center;
        cursor:pointer;
        display: inline-block;
        border-radius: 25px;
    }
    
    .last { 
        margin-bottom: 0;
    }
    
    .first{
        margin-top: 0;
    }
    
    .padding{
        padding:10px 0;
    }
    
    table.body-wrap { 
        width: 100%;
        padding: 20px;
    }
    
    table.body-wrap .container{
        border: 1px solid #f0f0f0;
    }
    
    table.footer-wrap { 
        width: 100%;	
        clear:both!important;
    }
    
    .footer-wrap .container p {
        font-size:12px;
        color:#666;
    }
    
    table.footer-wrap a{
        color: #999;
    }
    
    h1,h2,h3{
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
        line-height: 1.1; 
        margin-bottom:15px; 
        color:#000;
        margin: 40px 0 10px;
        line-height: 1.2;
        font-weight:200; 
    }
    
    h1 {
        font-size: 36px;
    }
    h2 {
        font-size: 28px;
        text-align:center;
    }
    h3 {
        font-size: 22px;
    }
    
    p, ul, ol { 
        margin-bottom: 10px; 
        font-weight: normal; 
        font-size:15px;
    }
    
    .container {
        display:block!important;
        max-width:600px!important;
        margin:0 auto!important; 
        clear:both!important;
    }
    
    .body-wrap .container{
        padding:20px;
    }
    
    .content {
        max-width:600px;
        margin:0 auto;
        display:block; 
    }
    
    .content table { 
        width: 100%; 
    }
    
    .center{
        text-align:center;
    }
    
    .left{
        text-align:left;
    }
    
    .logo{
        display:inline-block;
        width:399px;
        height:85px;
        max-width:90%;
    }
    
    .footnote{
        font-size:14px;
        color:#444;
    }
    </style>
    </head>
    
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                <table>
                    <tr>
                        <td class="center">
                            <div class="logo">
                                <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h2>Password Reset Request</h2>
                            <p>Hi ${user.firstName} ${user.lastName},</p>
                            <p>We received a request to reset the password for your ${process.env.APP_NAME} account. If you made this request, use the code below to reset your password:</p>
                            <table>
                                <tr>
                                    <td class="padding left">
                                        <p><strong>${code}</strong></p>
                                    </td>
                                </tr>
                            </table>
                            <p>This code is valid for one hour from the time this message was sent. If you did not request a password reset, please ignore this email.</p>
                            <p>Thank you,<br> The ${process.env.APP_NAME} Support Team.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p class="footnote">If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                        </td>
                    </tr>
                </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                <script>
                    document.write(new Date().getFullYear())
                    </script> © <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    
      `;
  },

  passwordResetNotification: (user: User): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${process.env.APP_NAME}</title>
    <style>
    * { 
        margin:0;
        padding:0;
        font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
        font-size: 100%;
        line-height: 1.6;
    }
    
    img { 
        max-width: 100%; 
    }
    
    body {
        -webkit-font-smoothing:antialiased; 
        -webkit-text-size-adjust:none; 
        width: 100%!important; 
        height: 100%;
    }
    
    a { 
        color: #348eda;
    }
    
    .btn-primary{
        text-decoration:none;
        color: #FFF;
        background-color: #348eda;
        border:solid #348eda;
        border-width:10px 20px;
        line-height:2;
        font-weight:bold;
        margin-right:10px;
        text-align:center;
        cursor:pointer;
        display: inline-block;
        border-radius: 25px;
    }
    
    .last { 
        margin-bottom: 0;
    }
    
    .first{
        margin-top: 0;
    }
    
    .padding{
        padding:10px 0;
    }
    
    table.body-wrap { 
        width: 100%;
        padding: 20px;
    }
    
    table.body-wrap .container{
        border: 1px solid #f0f0f0;
    }
    
    table.footer-wrap { 
        width: 100%;	
        clear:both!important;
    }
    
    .footer-wrap .container p {
        font-size:12px;
        color:#666;
    }
    
    table.footer-wrap a{
        color: #999;
    }
    
    h1,h2,h3{
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
        line-height: 1.1; 
        margin-bottom:15px; 
        color:#000;
        margin: 40px 0 10px;
        line-height: 1.2;
        font-weight:200; 
    }
    
    h1 {
        font-size: 36px;
    }
    h2 {
        font-size: 28px;
        text-align:center;
    }
    h3 {
        font-size: 22px;
    }
    
    p, ul, ol { 
        margin-bottom: 10px; 
        font-weight: normal; 
        font-size:15px;
    }
    
    .container {
        display:block!important;
        max-width:600px!important;
        margin:0 auto!important; 
        clear:both!important;
    }
    
    .body-wrap .container{
        padding:20px;
    }
    
    .content {
        max-width:600px;
        margin:0 auto;
        display:block; 
    }
    
    .content table { 
        width: 100%; 
    }
    
    .center{
        text-align:center;
    }
    
    .left{
        text-align:left;
    }
    
    .logo{
        display:inline-block;
        width:399px;
        height:85px;
        max-width:90%;
    }
    
    .footnote{
        font-size:14px;
        color:#444;
    }
    </style>
    </head>
    
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                <table>
                    <tr>
                        <td class="center">
                            <div class="logo">
                                <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h2>Password Reset Successful</h2>
                            <p>Hi ${user.firstName} ${user.lastName},</p>
                            <p>We wanted to let you know that your password has been successfully reset for your ${process.env.APP_NAME} account.</p>
                            <p>If you didn't make this change or suspect unauthorized access to your account, please contact our support team immediately.</p>
                            <p>Thank you,<br> The ${process.env.APP_NAME} Support Team.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p class="footnote">For any questions or concerns, feel free to contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                        </td>
                    </tr>
                </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                <script>
                    document.write(new Date().getFullYear())
                    </script> © <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    
      `;
  },

  adminPasswordResetNotification: (admin: Admin): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${process.env.APP_NAME}</title>
    <style>
    * { 
        margin:0;
        padding:0;
        font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
        font-size: 100%;
        line-height: 1.6;
    }
    
    img { 
        max-width: 100%; 
    }
    
    body {
        -webkit-font-smoothing:antialiased; 
        -webkit-text-size-adjust:none; 
        width: 100%!important; 
        height: 100%;
    }
    
    a { 
        color: #348eda;
    }
    
    .btn-primary{
        text-decoration:none;
        color: #FFF;
        background-color: #348eda;
        border:solid #348eda;
        border-width:10px 20px;
        line-height:2;
        font-weight:bold;
        margin-right:10px;
        text-align:center;
        cursor:pointer;
        display: inline-block;
        border-radius: 25px;
    }
    
    .last { 
        margin-bottom: 0;
    }
    
    .first{
        margin-top: 0;
    }
    
    .padding{
        padding:10px 0;
    }
    
    table.body-wrap { 
        width: 100%;
        padding: 20px;
    }
    
    table.body-wrap .container{
        border: 1px solid #f0f0f0;
    }
    
    table.footer-wrap { 
        width: 100%;	
        clear:both!important;
    }
    
    .footer-wrap .container p {
        font-size:12px;
        color:#666;
    }
    
    table.footer-wrap a{
        color: #999;
    }
    
    h1,h2,h3{
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
        line-height: 1.1; 
        margin-bottom:15px; 
        color:#000;
        margin: 40px 0 10px;
        line-height: 1.2;
        font-weight:200; 
    }
    
    h1 {
        font-size: 36px;
    }
    h2 {
        font-size: 28px;
        text-align:center;
    }
    h3 {
        font-size: 22px;
    }
    
    p, ul, ol { 
        margin-bottom: 10px; 
        font-weight: normal; 
        font-size:15px;
    }
    
    .container {
        display:block!important;
        max-width:600px!important;
        margin:0 auto!important; 
        clear:both!important;
    }
    
    .body-wrap .container{
        padding:20px;
    }
    
    .content {
        max-width:600px;
        margin:0 auto;
        display:block; 
    }
    
    .content table { 
        width: 100%; 
    }
    
    .center{
        text-align:center;
    }
    
    .left{
        text-align:left;
    }
    
    .logo{
        display:inline-block;
        width:399px;
        height:85px;
        max-width:90%;
    }
    
    .footnote{
        font-size:14px;
        color:#444;
    }
    </style>
    </head>
    
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                <table>
                    <tr>
                        <td class="center">
                            <div class="logo">
                                <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h2>Password Reset Successful</h2>
                            <p>Hi ${admin.name},</p>
                            <p>We wanted to let you know that your password has been successfully reset for your ${process.env.APP_NAME} account.</p>
                            <p>If you didn't make this change or suspect unauthorized access to your account, please contact our support team immediately.</p>
                            <p>Thank you,<br> The ${process.env.APP_NAME} Support Team.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p class="footnote">For any questions or concerns, feel free to contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                        </td>
                    </tr>
                </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                <script>
                    document.write(new Date().getFullYear())
                    </script> © <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    
      `;
  },

  resendCode: (user: User, code: string, newEmail: string): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Verify Your New Email</title>
        <style>
        * { 
            margin:0;
            padding:0;
            font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
            font-size: 100%;
            line-height: 1.6;
        }

        img { 
            max-width: 100%; 
        }

        body {
            -webkit-font-smoothing:antialiased; 
            -webkit-text-size-adjust:none; 
            width: 100%!important; 
            height: 100%;
        }

        a { 
            color: #348eda;
        }

        .btn-primary{
            text-decoration:none;
            color: #FFF;
            background-color: #348eda;
            border:solid #348eda;
            border-width:10px 20px;
            line-height:2;
            font-weight:bold;
            margin-right:10px;
            text-align:center;
            cursor:pointer;
            display: inline-block;
            border-radius: 25px;
        }

        .last { 
            margin-bottom: 0;
        }

        .first{
            margin-top: 0;
        }

        .padding{
            padding:10px 0;
        }

        table.body-wrap { 
            width: 100%;
            padding: 20px;
        }

        table.body-wrap .container{
            border: 1px solid #f0f0f0;
        }

        table.footer-wrap { 
            width: 100%;	
            clear:both!important;
        }

        .footer-wrap .container p {
            font-size:12px;
            color:#666;
        }

        table.footer-wrap a{
            color: #999;
        }

        h1,h2,h3{
            font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
            line-height: 1.1; 
            margin-bottom:15px; 
            color:#000;
            margin: 40px 0 10px;
            line-height: 1.2;
            font-weight:200; 
        }

        h1 {
            font-size: 36px;
        }
        h2 {
            font-size: 28px;
            text-align:center;
        }
        h3 {
            font-size: 22px;
        }

        p, ul, ol { 
            margin-bottom: 10px; 
            font-weight: normal; 
            font-size:15px;
        }

        ul li, ol li {
            margin-left:5px;
            list-style-position: inside;
        }

        .container {
            display:block!important;
            max-width:600px!important;
            margin:0 auto!important; 
            clear:both!important;
        }

        .body-wrap .container{
            padding:20px;
        }

        .content {
            max-width:600px;
            margin:0 auto;
            display:block; 
        }

        .content table { 
            width: 100%; 
        }

        .center{
            text-align:center;
        }

        .left{
            text-align:left;
        }

        .logo{
            display:inline-block;
            width:399px;
            height:85px;
            max-width:90%;
        }

        .footnote{
            font-size:14px;
            color:#444;
        }
        </style>
        </head>

        <body bgcolor="#f6f6f6">

        <!-- body -->
        <table class="body-wrap">
            <tr>
                <td></td>
                <td class="container" bgcolor="#FFFFFF">
                    <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Verify Your New Email Address</h2>
                                <p>Hi ${user.firstName} ${user.lastName},</p>
                                <p>We received a request to change the email address associated with your ${process.env.APP_NAME} account. To confirm this email address (${newEmail}), please enter the code below to complete the process:</p>
                                <table>
                                    <tr>
                                        <td class="padding left">
                                            <p><strong>${code}</strong></p>
                                        </td>
                                    </tr>
                                </table>
                                <p>This verification code is valid for one hour.</p>
                                <p>If you did not request this change, please ignore this email or contact our support team immediately.</p>
                                <p>Thank you,<br> The ${process.env.APP_NAME} Support Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">If you encounter any issues, please contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> and we will assist you.</p>
                            </td>
                        </tr>
                    </table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- footer -->
        <table class="footer-wrap">
            <tr>
                <td></td>
                <td class="container">
                    <div class="content">
                        <table>
                            <tr>
                                <td align="center">
                                    <script>
                        document.write(new Date().getFullYear())
                        </script> © <a href="#">${process.env.APP_NAME}</a>.
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>

        </body>
        </html>

    `;
  },

  emailAddressChanged: (user: User): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Email Address Changed</title>
        <style>
        * { 
            margin:0;
            padding:0;
            font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
            font-size: 100%;
            line-height: 1.6;
        }

        img { 
            max-width: 100%; 
        }

        body {
            -webkit-font-smoothing:antialiased; 
            -webkit-text-size-adjust:none; 
            width: 100%!important; 
            height: 100%;
        }

        a { 
            color: #348eda;
        }

        .btn-primary{
            text-decoration:none;
            color: #FFF;
            background-color: #348eda;
            border:solid #348eda;
            border-width:10px 20px;
            line-height:2;
            font-weight:bold;
            margin-right:10px;
            text-align:center;
            cursor:pointer;
            display: inline-block;
            border-radius: 25px;
        }

        .last { 
            margin-bottom: 0;
        }

        .first{
            margin-top: 0;
        }

        .padding{
            padding:10px 0;
        }

        table.body-wrap { 
            width: 100%;
            padding: 20px;
        }

        table.body-wrap .container{
            border: 1px solid #f0f0f0;
        }

        table.footer-wrap { 
            width: 100%;	
            clear:both!important;
        }

        .footer-wrap .container p {
            font-size:12px;
            color:#666;
        }

        table.footer-wrap a{
            color: #999;
        }

        h1,h2,h3{
            font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
            line-height: 1.1; 
            margin-bottom:15px; 
            color:#000;
            margin: 40px 0 10px;
            line-height: 1.2;
            font-weight:200; 
        }

        h1 {
            font-size: 36px;
        }
        h2 {
            font-size: 28px;
            text-align:center;
        }
        h3 {
            font-size: 22px;
        }

        p, ul, ol { 
            margin-bottom: 10px; 
            font-weight: normal; 
            font-size:15px;
        }

        ul li, ol li {
            margin-left:5px;
            list-style-position: inside;
        }

        .container {
            display:block!important;
            max-width:600px!important;
            margin:0 auto!important; 
            clear:both!important;
        }

        .body-wrap .container{
            padding:20px;
        }

        .content {
            max-width:600px;
            margin:0 auto;
            display:block; 
        }

        .content table { 
            width: 100%; 
        }

        .center{
            text-align:center;
        }

        .left{
            text-align:left;
        }

        .logo{
            display:inline-block;
            width:399px;
            height:85px;
            max-width:90%;
        }

        .footnote{
            font-size:14px;
            color:#444;
        }
        </style>
        </head>

        <body bgcolor="#f6f6f6">

        <!-- body -->
        <table class="body-wrap">
            <tr>
                <td></td>
                <td class="container" bgcolor="#FFFFFF">
                    <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Your Email Address Has Been Changed</h2>
                                <p>Hi ${user.firstName} ${user.lastName},</p>
                                <p>This is a confirmation that your email address for your ${process.env.APP_NAME} account has been successfully updated to ${user.email}.</p>
                                <p>If you did not make this request or you believe this is a mistake, please contact our support team immediately at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                                <p>Thank you,<br> The ${process.env.APP_NAME} Support Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">If you encounter any issues, please contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> and we will assist you as soon as possible.</p>
                            </td>
                        </tr>
                    </table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- footer -->
        <table class="footer-wrap">
            <tr>
                <td></td>
                <td class="container">
                    <div class="content">
                        <table>
                            <tr>
                                <td align="center">
                                    <script>
                        document.write(new Date().getFullYear())
                        </script> © <a href="#">${process.env.APP_NAME}</a>.
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>

        </body>
        </html>

    `;
  },

  phoneNumberUpdated: (user: User): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Phone Number Updated</title>
        <style>
        * { 
            margin:0;
            padding:0;
            font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
            font-size: 100%;
            line-height: 1.6;
        }

        img { 
            max-width: 100%; 
        }

        body {
            -webkit-font-smoothing:antialiased; 
            -webkit-text-size-adjust:none; 
            width: 100%!important; 
            height: 100%;
        }

        a { 
            color: #348eda;
        }

        .btn-primary{
            text-decoration:none;
            color: #FFF;
            background-color: #348eda;
            border:solid #348eda;
            border-width:10px 20px;
            line-height:2;
            font-weight:bold;
            margin-right:10px;
            text-align:center;
            cursor:pointer;
            display: inline-block;
            border-radius: 25px;
        }

        .last { 
            margin-bottom: 0;
        }

        .first{
            margin-top: 0;
        }

        .padding{
            padding:10px 0;
        }

        table.body-wrap { 
            width: 100%;
            padding: 20px;
        }

        table.body-wrap .container{
            border: 1px solid #f0f0f0;
        }

        table.footer-wrap { 
            width: 100%;	
            clear:both!important;
        }

        .footer-wrap .container p {
            font-size:12px;
            color:#666;
        }

        table.footer-wrap a{
            color: #999;
        }

        h1,h2,h3{
            font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
            line-height: 1.1; 
            margin-bottom:15px; 
            color:#000;
            margin: 40px 0 10px;
            line-height: 1.2;
            font-weight:200; 
        }

        h1 {
            font-size: 36px;
        }
        h2 {
            font-size: 28px;
            text-align:center;
        }
        h3 {
            font-size: 22px;
        }

        p, ul, ol { 
            margin-bottom: 10px; 
            font-weight: normal; 
            font-size:15px;
        }

        ul li, ol li {
            margin-left:5px;
            list-style-position: inside;
        }

        .container {
            display:block!important;
            max-width:600px!important;
            margin:0 auto!important; 
            clear:both!important;
        }

        .body-wrap .container{
            padding:20px;
        }

        .content {
            max-width:600px;
            margin:0 auto;
            display:block; 
        }

        .content table { 
            width: 100%; 
        }

        .center{
            text-align:center;
        }

        .left{
            text-align:left;
        }

        .logo{
            display:inline-block;
            width:399px;
            height:85px;
            max-width:90%;
        }

        .footnote{
            font-size:14px;
            color:#444;
        }
        </style>
        </head>

        <body bgcolor="#f6f6f6">

        <!-- body -->
        <table class="body-wrap">
            <tr>
                <td></td>
                <td class="container" bgcolor="#FFFFFF">
                    <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Phone Number Updated</h2>
                                <p>Hi ${user.firstName} ${user.lastName},</p>
                                <p>We wanted to inform you that the phone number associated with your ${process.env.APP_NAME} account has been successfully updated.</p>
                                <p>If you did not request this change or believe this was done in error, please contact our support team immediately.</p>
                                <p>Thank you for using ${process.env.APP_NAME}. We are here to ensure your account's security at all times.</p>
                                <p>Thank you,<br>The ${process.env.APP_NAME} Support Team</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">If you have any questions, please contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> and we will assist you as soon as possible.</p>
                            </td>
                        </tr>
                    </table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- footer -->
        <table class="footer-wrap">
            <tr>
                <td></td>
                <td class="container">
                    <div class="content">
                        <table>
                            <tr>
                                <td align="center">
                                    <script>
                        document.write(new Date().getFullYear())
                        </script> © <a href="#">${process.env.APP_NAME}</a>.
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>

        </body>
        </html>

    `;
  },

  subAdminCreated: (subAdmin: Admin, temporaryPassword: string): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Sub-Admin Login Details</title>
        <style>
        * { 
            margin:0;
            padding:0;
            font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
            font-size: 100%;
            line-height: 1.6;
        }

        img { 
            max-width: 100%; 
        }

        body {
            -webkit-font-smoothing:antialiased; 
            -webkit-text-size-adjust:none; 
            width: 100%!important; 
            height: 100%;
        }

        a { 
            color: #348eda;
        }

        .btn-primary{
            text-decoration:none;
            color: #FFF;
            background-color: #348eda;
            border:solid #348eda;
            border-width:10px 20px;
            line-height:2;
            font-weight:bold;
            margin-right:10px;
            text-align:center;
            cursor:pointer;
            display: inline-block;
            border-radius: 25px;
        }

        .last { 
            margin-bottom: 0;
        }

        .first{
            margin-top: 0;
        }

        .padding{
            padding:10px 0;
        }

        table.body-wrap { 
            width: 100%;
            padding: 20px;
        }

        table.body-wrap .container{
            border: 1px solid #f0f0f0;
        }

        table.footer-wrap { 
            width: 100%;	
            clear:both!important;
        }

        .footer-wrap .container p {
            font-size:12px;
            color:#666;
        }

        table.footer-wrap a{
            color: #999;
        }

        h1,h2,h3{
            font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
            line-height: 1.1; 
            margin-bottom:15px; 
            color:#000;
            margin: 40px 0 10px;
            line-height: 1.2;
            font-weight:200; 
        }

        h1 {
            font-size: 36px;
        }
        h2 {
            font-size: 28px;
            text-align:center;
        }
        h3 {
            font-size: 22px;
        }

        p, ul, ol { 
            margin-bottom: 10px; 
            font-weight: normal; 
            font-size:15px;
        }

        ul li, ol li {
            margin-left:5px;
            list-style-position: inside;
        }

        .container {
            display:block!important;
            max-width:600px!important;
            margin:0 auto!important; 
            clear:both!important;
        }

        .body-wrap .container{
            padding:20px;
        }

        .content {
            max-width:600px;
            margin:0 auto;
            display:block; 
        }

        .content table { 
            width: 100%; 
        }

        .center{
            text-align:center;
        }

        .left{
            text-align:left;
        }

        .logo{
            display:inline-block;
            width:399px;
            height:85px;
            max-width:90%;
        }

        .footnote{
            font-size:14px;
            color:#444;
        }
        </style>
        </head>

        <body bgcolor="#f6f6f6">

        <!-- body -->
        <table class="body-wrap">
            <tr>
                <td></td>
                <td class="container" bgcolor="#FFFFFF">
                    <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Sub-Admin Account Created</h2>
                                <p>Hi ${subAdmin.name},</p>
                                <p>Your sub-admin account has been created on the ${process.env.APP_NAME} platform. You can use the login details provided below to access your account:</p>
                                <table>
                                    <tr>
                                        <td class="padding left">
                                            <p><strong>Login Details:</strong></p>
                                            <p>Email: <strong>${subAdmin.email}</strong></p>
                                            <p>Password: <strong>${temporaryPassword}</strong></p>
                                            <p>Link: <a href="${process.env.ADMIN_LINK}">${process.env.ADMIN_LINK}</a></p>
                                        </td>
                                    </tr>
                                </table>
                                <p>Please log in to your account and change your password after your first login.</p>
                                <p>If you encounter any issues, feel free to reach out to our support team.</p>
                                <p>Thank you,<br> The ${process.env.APP_NAME} Support Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">If you encounter any issues, please contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> and we will assist you.</p>
                            </td>
                        </tr>
                    </table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- footer -->
        <table class="footer-wrap">
            <tr>
                <td></td>
                <td class="container">
                    <div class="content">
                        <table>
                            <tr>
                                <td align="center">
                                    <script>
                        document.write(new Date().getFullYear())
                        </script> © <a href="#">${process.env.APP_NAME}</a>.
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>

        </body>
        </html>
    `;
  },

  kycStatusUpdate: (
    user: User,
    isApproved: boolean,
    adminNote?: string
  ): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - KYC Notification</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${
      process.env.APP_NAME
    }" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>KYC Status Update</h2>
                                <p>Hi ${user.firstName} ${user.lastName},</p>
                                <p>Your KYC submission has been reviewed.</p>
                                <p>Status: <strong>${
                                  isApproved ? 'Approved' : 'Rejected'
                                }</strong></p>
                                ${
                                  !isApproved
                                    ? `<p>Note: ${
                                        adminNote ||
                                        'No additional notes provided.'
                                      }</p>`
                                    : ''
                                }
                                <p>Thank you for your cooperation!</p>
                                <p>If you have any questions, feel free to reach out to our support team.</p>
                                <p>Best regards,<br> The ${
                                  process.env.APP_NAME
                                } Support Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${
                                  process.env.SUPPORT_EMAIL
                                }">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${
                                  process.env.APP_NAME
                                }</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  outBidNotification: (
    highestBid: any,
    auctionProduct: AuctionProduct
  ): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Outbid Notification</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>You Have Been Outbid!</h2>
                                <p>Hi ${highestBid.user.firstName} ${highestBid.user.lastName},</p>
                                <p>Unfortunately, someone has placed a higher bid on the product <strong>${auctionProduct.name}</strong>.</p>
                                <p><strong>Current Bid:</strong> ${highestBid.bidAmount}</p>
                                <p>Don't worry, you can still place a higher bid to regain the top spot!</p>
                                <p>Best of luck!</p>
                                <p>If you have any questions, feel free to reach out to our support team.</p>
                                <p>Best regards,<br> The ${process.env.APP_NAME} Support Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  interestNotification: (
    user: User,
    amountPaid: number,
    auctionProduct: AuctionProduct
  ): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Interest Notification</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${
      process.env.APP_NAME
    }" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Auction Interest Confirmation!</h2>
                                <p>Hi ${user.firstName} ${user.lastName},</p>
                                <p>Thank you for showing interest in the auction for <strong>${
                                  auctionProduct.name
                                }</strong>.</p>
                                <p>Your payment of <strong>${amountPaid.toFixed(
                                  2
                                )}</strong> has been successfully recorded.</p>
                                <p>The auction is scheduled to start on <strong>${new Date(
                                  auctionProduct.startDate
                                ).toLocaleString()}</strong>.</p>
                                <p>Stay tuned for updates!</p>
                                <p>Best Regards,<br>${
                                  process.env.APP_NAME
                                } Team</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${
                                  process.env.SUPPORT_EMAIL
                                }">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${
                                  process.env.APP_NAME
                                }</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  applicantNotify: (job: Job, application: Applicant): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Application Confirmation</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
                color: #7008fa;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${
      process.env.APP_NAME
    }" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Application Confirmation</h2>
                                <p>Hi ${application.name},</p>
                                <p>Your application was sent to ${
                                  process.env.APP_NAME
                                }</p>
                                <p><strong>${job.title}</strong></p>
                                <p><strong>${job.location}</strong></p>
                                <p><strong>${new Date(
                                  application.createdAt
                                ).toLocaleString()}</strong></p>
                                <p>We will notify you of any updates regarding your application.</p>
                                <p>If you have any questions, feel free to reach out to our support team.</p>
                                <p>Best regards,<br> The ${
                                  process.env.APP_NAME
                                } Support Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${
                                  process.env.SUPPORT_EMAIL
                                }">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                               <script>document.write(new Date().getFullYear())</script> © <a href="#">${
                                 process.env.APP_NAME
                               }</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  jobOwnerMailData: (
    job: Job,
    creator: Admin,
    application: Applicant
  ): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - New Job Application</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
                color: #7008fa;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Application Confirmation</h2>
                                <p>Hi ${creator.name},</p>
                                <p>A new application has been received for the position of ${job.title}.</p>
                                <p>Below are the applicant details:</p>
                                <p>Name: <strong>${application.name}</strong></p>
                                <p>Email: <strong>${application.emailAddress}</strong></p>
                                <table>
                                    <tr>
                                        <td class="padding left">
                                            <p><a href="${application.resume}">Download Resume</a></p>                                      </td>
                                    </tr>
                                </table>
                                <p>Please review the application and proceed accordingly.</p>
                                <p>If you have any questions, feel free to reach out to our support team.</p>
                                <p>Best regards,<br> The ${process.env.APP_NAME} Support Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  orderConfirmationNotification: (
    user: User,
    order: Order,
    vendorOrders: { [key: string]: OrderItem[] },
    currency: string
  ): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    let itemsHtml = '';

    for (const vendorId in vendorOrders) {
      itemsHtml += `<h4>Product Details</h4><ul>`;

      for (const item of vendorOrders[vendorId]) {
        const product = item.product as {
          id: string;
          sku?: string;
          name: string;
          price: number;
        };

        // Check if SKU is empty, use product.id instead
        const productId =
          product.sku && product.sku.trim() ? product.sku : product.id;

        itemsHtml += `
                <li><strong>Product ID:</strong> ${productId} </li>
                <li><strong>Product:</strong> ${product.name} </li>
                <li><strong>Quantity:</strong> ${item.quantity} </li>
                <li><strong>Price:</strong> ${currency}${Number(
          item.price
        ).toFixed(2)}</li>
            `;
      }

      itemsHtml += `</ul>`;
    }

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Order Confirmation Notification</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Order Confirmation</h2>
                                <p>Hi ${user.firstName} ${user.lastName},</p>
                                <p>Thank you for your purchase! Your order TRACKING NO is <strong>${order.trackingNumber}</strong>.</p>
                                ${itemsHtml}
                                <p>We are processing your order and will notify you once it has been shipped.</p>
                                <p>For any questions, feel free to contact our support team.</p>
                                <p>Best regards,<br> The ${process.env.APP_NAME} Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  newOrderNotification: (
    vendor: User,
    order: Order,
    customer?: User, // Add customer as optional
    product?: any // Add product/orderItem as optional
  ): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - New Order Notification</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }
            img { max-width: 100%; }
            body { -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none; width: 100%!important; height: 100%; }
            a { color: #348eda; }
            .btn-primary{ text-decoration:none; color: #FFF; background-color: #348eda; border:solid #348eda; border-width:10px 20px; line-height:2; font-weight:bold; margin-right:10px; text-align:center; cursor:pointer; display: inline-block; border-radius: 25px; }
            .last { margin-bottom: 0; }
            .first{ margin-top: 0; }
            .padding{ padding:10px 0; }
            table.body-wrap { width: 100%; padding: 20px; }
            table.body-wrap .container{ border: 1px solid #f0f0f0; }
            table.footer-wrap { width: 100%; clear:both!important; }
            .footer-wrap .container p { font-size:12px; color:#666; }
            table.footer-wrap a{ color: #999; }
            h1,h2,h3{ font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; line-height: 1.1; margin-bottom:15px; color:#000; margin: 40px 0 10px; line-height: 1.2; font-weight:200; }
            h1 { font-size: 36px; }
            h2 { font-size: 28px; text-align:center; }
            h3 { font-size: 22px; }
            p, ul, ol { margin-bottom: 10px; font-weight: normal; font-size:15px; }
            ul li, ol li { margin-left:5px; list-style-position: inside; }
            .container { display:block!important; max-width:600px!important; margin:0 auto!important; clear:both!important; }
            .body-wrap .container{ padding:20px; }
            .content { max-width:600px; margin:0 auto; display:block; }
            .content table { width: 100%; }
            .center{ text-align:center; }
            .left{ text-align:left; }
            .logo{ display:inline-block; width:399px; height:85px; max-width:90%; }
            .footnote{ font-size:14px; color:#444; }
            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){ .logo{ background-image:url(chartblocks@2x.png); background-size:100% auto; background-repeat:no-repeat; } .logo img{ visibility:hidden; } }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${
      process.env.APP_NAME
    }" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>New Order Received</h2>
                                <p>Hi ${vendor.firstName} ${
      vendor.lastName
    },</p>
                                <p>A new order (TRACKING NO: <strong>${
                                  order.trackingNumber
                                }</strong>) has been placed for one of your products.</p>
                                ${
                                  customer
                                    ? `<h3>Customer Details</h3>
                                <ul>
                                    <li><strong>Name:</strong> ${
                                      customer.firstName
                                    } ${customer.lastName}</li>
                                    <li><strong>Email:</strong> ${
                                      customer.email
                                    }</li>
                                    <li><strong>Phone:</strong> ${
                                      customer.phoneNumber || ''
                                    }</li>
                                </ul>`
                                    : ''
                                }
                                ${
                                  product
                                    ? `<h3>Product Details</h3>
                                <ul>
                                    <li><strong>Product Name:</strong> ${
                                      product.name ||
                                      product.product?.name ||
                                      ''
                                    }</li>
                                    <li><strong>SKU:</strong> ${
                                      product.sku || product.product?.sku || ''
                                    }</li>
                                    <li><strong>Quantity:</strong> ${
                                      product.quantity || ''
                                    }</li>
                                    <li><strong>Price:</strong> ${
                                      product.price || ''
                                    }</li>
                                </ul>`
                                    : ''
                                }
                                <p>If you have any questions, feel free to contact our support team.</p>
                                <p>Best regards,<br> The ${
                                  process.env.APP_NAME
                                } Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${
                                  process.env.SUPPORT_EMAIL
                                }">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${
                                  process.env.APP_NAME
                                }</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    </body>
    </html>`;
  },

  newOrderAdminNotification: (admin: Admin, order: Order): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - New Order Notification</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>New Order Received</h2>
                                <p>Hi ${admin.name},</p>
                                <p>A new order (Order TRACKING NO: <strong>${order.trackingNumber}</strong>) has been placed for one of your products.</p>
                                <p>If you have any questions, feel free to contact our support team.</p>
                                <p>Best regards,<br> The ${process.env.APP_NAME} Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  auctionProductConfirmationNotification: (
    user: User,
    auction: AuctionProduct,
    winningBid: number
  ): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Auction Product Notification</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${process.env.APP_NAME}" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>🎉 Congratulations! You've Won the Auction!</h2>
                                <p>Hi ${user.firstName} ${user.lastName},</p>
                                <p>You are the highest bidder for <strong>${auction.name}</strong>.</p>
                                <p>Your winning bid: <strong>${winningBid}</strong></p>
                                <p>Next steps:</p>
                                <ul>
                                    <li>Complete your payment to secure your item.</li>
                                    <li>Check your account for payment instructions.</li>
                                    <li>Our team will contact you shortly for delivery arrangements.</li>
                                </ul>
                                <p>Thank you for participating in our auction. We look forward to serving you!</p>
                                <p>Best regards,<br> The ${process.env.APP_NAME} Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${process.env.APP_NAME}</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  orderStatusUpdateNotification: (
    user: User,
    status: string,
    productName: string
  ): string => {
    const logoUrl: string | undefined = process.env.LOGO_URL;

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${process.env.APP_NAME} - Order Status Notification</title>
        <style>
            * { 
                margin:0;
                padding:0;
                font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; 
                font-size: 100%;
                line-height: 1.6;
            }

            img { 
                max-width: 100%; 
            }

            body {
                -webkit-font-smoothing:antialiased; 
                -webkit-text-size-adjust:none; 
                width: 100%!important; 
                height: 100%;
            }

            a { 
                color: #348eda;
            }

            .btn-primary{
                text-decoration:none;
                color: #FFF;
                background-color: #348eda;
                border:solid #348eda;
                border-width:10px 20px;
                line-height:2;
                font-weight:bold;
                margin-right:10px;
                text-align:center;
                cursor:pointer;
                display: inline-block;
                border-radius: 25px;
            }

            .last { 
                margin-bottom: 0;
            }

            .first{
                margin-top: 0;
            }

            .padding{
                padding:10px 0;
            }

            table.body-wrap { 
                width: 100%;
                padding: 20px;
            }

            table.body-wrap .container{
                border: 1px solid #f0f0f0;
            }

            table.footer-wrap { 
                width: 100%;	
                clear:both!important;
            }

            .footer-wrap .container p {
                font-size:12px;
                color:#666;
            }

            table.footer-wrap a{
                color: #999;
            }

            h1,h2,h3{
                font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; 
                line-height: 1.1; 
                margin-bottom:15px; 
                color:#000;
                margin: 40px 0 10px;
                line-height: 1.2;
                font-weight:200; 
            }

            h1 {
                font-size: 36px;
            }
            h2 {
                font-size: 28px;
                text-align:center;
            }
            h3 {
                font-size: 22px;
            }

            p, ul, ol { 
                margin-bottom: 10px; 
                font-weight: normal; 
                font-size:15px;
            }

            ul li, ol li {
                margin-left:5px;
                list-style-position: inside;
            }

            .container {
                display:block!important;
                max-width:600px!important;
                margin:0 auto!important; 
                clear:both!important;
            }

            .body-wrap .container{
                padding:20px;
            }

            .content {
                max-width:600px;
                margin:0 auto;
                display:block; 
            }

            .content table { 
                width: 100%; 
            }

            .center{
                text-align:center;
            }

            .left{
                text-align:left;
            }

            .logo{
                display:inline-block;
                width:399px;
                height:85px;
                max-width:90%;
            }

            .footnote{
                font-size:14px;
                color:#444;
            }

            @media all and (min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx){
                .logo{
                    background-image:url(chartblocks@2x.png);
                    background-size:100% auto;
                    background-repeat:no-repeat;
                }
                .logo img{
                    visibility:hidden;
                }
            }        
        </style>
    </head>
    <body bgcolor="#f6f6f6">
    
    <!-- body -->
    <table class="body-wrap">
        <tr>
            <td></td>
            <td class="container" bgcolor="#FFFFFF">
                <div class="content">
                    <table>
                        <tr>
                            <td class="center">
                                <div class="logo">
                                    <img src="${logoUrl}" alt="Logo of ${
      process.env.APP_NAME
    }" width="150px">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h2>Order Status</h2>
                                <p>Hi ${user.firstName} ${user.lastName},</p>
                                <p>Your order for product: <strong>${
                                  productName ?? 'your item'
                                }</strong> has been updated to <strong>${status}</strong>.</p>
                                <p>Thank you for shopping with us.</p>
                                <p>For any questions, feel free to contact our support team.</p>
                                <p>Best regards,<br> The ${
                                  process.env.APP_NAME
                                } Team.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="footnote">For assistance, please contact us at <a href="mailto:${
                                  process.env.SUPPORT_EMAIL
                                }">${process.env.SUPPORT_EMAIL}</a>.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    <!-- footer -->
    <table class="footer-wrap">
        <tr>
            <td></td>
            <td class="container">
                <div class="content">
                    <table>
                        <tr>
                            <td align="center">
                                © <script>document.write(new Date().getFullYear())</script> <a href="#">${
                                  process.env.APP_NAME
                                }</a>.
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td></td>
        </tr>
    </table>
    
    </body>
    </html>
    `;
  },

  // Add more templates as needed
};
