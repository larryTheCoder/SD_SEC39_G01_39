import nodemailer from "nodemailer";
import {prisma} from "@/libs/database";
import {SignJWT} from "jose";
import {getJwtSecretKey} from "@/libs/auth";
import {getDeploymentUrl} from "@/libs/util";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

export async function sendPasswordResetMail(email: string, token: string) {
    const real_token = getDeploymentUrl() + "/reset/" + token;
    const result = await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Reset your MudahMail password.",
        html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Verify your MudahMail Account</title><style>@media only screen and (max-width:620px){table[class=body] h1{font-size:28px!important;margin-bottom:10px!important}table[class=body] a,table[class=body] ol,table[class=body] p,table[class=body] span,table[class=body] td,table[class=body] ul{font-size:16px!important}table[class=body] .article,table[class=body] .wrapper{padding:10px!important}table[class=body] .content{padding:0!important}table[class=body] .container{padding:0!important;width:100%!important}table[class=body] .main{border-left-width:0!important;border-radius:0!important;border-right-width:0!important}table[class=body] .btn table{width:100%!important}table[class=body] .btn a{width:100%!important}table[class=body] .img-responsive{height:auto!important;max-width:100%!important;width:auto!important}}@media all{.ExternalClass{width:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}.apple-link a{color:inherit!important;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;line-height:inherit!important;text-decoration:none!important}.btn-primary table td:hover{background-color:#d5075d!important}.btn-primary a:hover{background-color:#d5075d!important;border-color:#d5075d!important}}</style></head><body class style="background-color:#eaebed;font-family:sans-serif;-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.4;margin:0;padding:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse:separate;mso-table-lspace:0;mso-table-rspace:0;min-width:100%;background-color:#eaebed;width:100%" width="100%" bgcolor="#eaebed"><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">&nbsp;</td><td class="container" style="font-family:sans-serif;font-size:14px;vertical-align:top;display:block;max-width:580px;padding:10px;width:580px;Margin:0 auto" width="580" valign="top"><div class="header" style="padding:20px 0"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;mso-table-lspace:0;mso-table-rspace:0;min-width:100%;width:100%"><tr><td class="align-center" width="100%" style="font-family:sans-serif;font-size:14px;vertical-align:top;text-align:center" valign="top" align="center"><a href="' + getDeploymentUrl() + '" style="color:#ec0867;text-decoration:underline"><img src="https://cdn.discordapp.com/attachments/512987829970665482/1157674014593011833/Untitled-_1_.png" height="100" alt="MudahMail" style="border:none;-ms-interpolation-mode:bicubic;max-width:100%"></a></td></tr></table></div><div class="content" style="box-sizing:border-box;display:block;Margin:0 auto;max-width:580px;padding:10px"><span class="preheader" style="color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;visibility:hidden;width:0">Verify Your MudahMail Account.</span><table role="presentation" class="main" style="border-collapse:separate;mso-table-lspace:0;mso-table-rspace:0;min-width:100%;background:#fff;border-radius:3px;width:100%" width="100%"><tr><td class="wrapper" style="font-family:sans-serif;font-size:14px;vertical-align:top;box-sizing:border-box;padding:20px" valign="top"><table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;mso-table-lspace:0;mso-table-rspace:0;min-width:100%;width:100%" width="100%"><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top"><p style="font-family:sans-serif;font-size:14px;font-weight:400;margin:0;margin-bottom:15px">Hello user.</p><p style="font-family:sans-serif;font-size:14px;font-weight:400;margin:0;margin-bottom:15px">We have received a request to reset your MudahMail password.</p><p style="font-family:sans-serif;font-size:14px;font-weight:400;margin:0;margin-bottom:15px">The password request link will expire in 30 minutes.</p><p style="font-family:sans-serif;font-size:14px;font-weight:400;margin:0;margin-bottom:15px">Click on the link below to directly change your password:</p><p style="font-family:sans-serif;font-size:14px;font-weight:400;margin:0;margin-bottom:15px">If you didn\'t request for a password reset or got this email by mistake, please ignore this email.</p><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse:separate;mso-table-lspace:0;mso-table-rspace:0;min-width:100%;box-sizing:border-box;width:100%" width="100%"><tbody><tr><td align="center" style="font-family:sans-serif;font-size:14px;vertical-align:top;padding-bottom:15px" valign="top"><table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;mso-table-lspace:0;mso-table-rspace:0;min-width:auto;width:auto"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top;border-radius:5px;text-align:center;background-color:#ec0867" valign="top" align="center" bgcolor="#ec0867"><a href="' + real_token + '" target="_blank" style="border:solid 1px #ec0867;border-radius:5px;box-sizing:border-box;cursor:pointer;display:inline-block;font-size:14px;font-weight:700;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize;background-color:#ec0867;border-color:#ec0867;color:#fff">Reset Password</a></td></tr></tbody></table></td></tr></tbody></table><p style="font-family:sans-serif;font-size:14px;font-weight:400;margin:0;margin-bottom:15px">Alternatively, you can click on this link: ' + real_token + '</p></td></tr></table></td></tr></table></div></td><td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">&nbsp;</td></tr></table></body></html>'
    });
}

export async function sendVerificationMail(email: string) {
    const lastDay = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();
    const lastSent = await prisma.userVerification.findFirst({
        where: {
            AND: [
                {user_email: email},
                {lastSent: {lte: lastDay}}
            ]
        }
    })

    if (lastSent !== null) {
        return false;
    }

    const login_token = await new SignJWT({
        username: email,
    }).setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(getJwtSecretKey())

    await prisma.userVerification.upsert({
        where: {
            user_email: email,
        },
        create: {user_email: email},
        update: {lastSent: new Date().toISOString()}
    })

    const real_token = getDeploymentUrl() + "/verify/" + login_token;
    const result = await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Verify Your MudahMail Account.",
        html: "<!DOCTYPE html>\n" +
            "<html>\n" +
            "  <head>\n" +
            "    <meta name='viewport' content='width=device-width'>\n" +
            "    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>\n" +
            "    <title>Verify your MudahMail Account</title>\n" +
            "  <style>\n" +
            "@media only screen and (max-width: 620px) {\n" +
            "  table[class=body] h1 {\n" +
            "    font-size: 28px !important;\n" +
            "    margin-bottom: 10px !important;\n" +
            "  }\n" +
            "\n" +
            "  table[class=body] p,\n" +
            "table[class=body] ul,\n" +
            "table[class=body] ol,\n" +
            "table[class=body] td,\n" +
            "table[class=body] span,\n" +
            "table[class=body] a {\n" +
            "    font-size: 16px !important;\n" +
            "  }\n" +
            "\n" +
            "  table[class=body] .wrapper,\n" +
            "table[class=body] .article {\n" +
            "    padding: 10px !important;\n" +
            "  }\n" +
            "\n" +
            "  table[class=body] .content {\n" +
            "    padding: 0 !important;\n" +
            "  }\n" +
            "\n" +
            "  table[class=body] .container {\n" +
            "    padding: 0 !important;\n" +
            "    width: 100% !important;\n" +
            "  }\n" +
            "\n" +
            "  table[class=body] .main {\n" +
            "    border-left-width: 0 !important;\n" +
            "    border-radius: 0 !important;\n" +
            "    border-right-width: 0 !important;\n" +
            "  }\n" +
            "\n" +
            "  table[class=body] .btn table {\n" +
            "    width: 100% !important;\n" +
            "  }\n" +
            "\n" +
            "  table[class=body] .btn a {\n" +
            "    width: 100% !important;\n" +
            "  }\n" +
            "\n" +
            "  table[class=body] .img-responsive {\n" +
            "    height: auto !important;\n" +
            "    max-width: 100% !important;\n" +
            "    width: auto !important;\n" +
            "  }\n" +
            "}\n" +
            "@media all {\n" +
            "  .ExternalClass {\n" +
            "    width: 100%;\n" +
            "  }\n" +
            "\n" +
            "  .ExternalClass,\n" +
            ".ExternalClass p,\n" +
            ".ExternalClass span,\n" +
            ".ExternalClass font,\n" +
            ".ExternalClass td,\n" +
            ".ExternalClass div {\n" +
            "    line-height: 100%;\n" +
            "  }\n" +
            "\n" +
            "  .apple-link a {\n" +
            "    color: inherit !important;\n" +
            "    font-family: inherit !important;\n" +
            "    font-size: inherit !important;\n" +
            "    font-weight: inherit !important;\n" +
            "    line-height: inherit !important;\n" +
            "    text-decoration: none !important;\n" +
            "  }\n" +
            "\n" +
            "  .btn-primary table td:hover {\n" +
            "    background-color: #d5075d !important;\n" +
            "  }\n" +
            "\n" +
            "  .btn-primary a:hover {\n" +
            "    background-color: #d5075d !important;\n" +
            "    border-color: #d5075d !important;\n" +
            "  }\n" +
            "}\n" +
            "</style></head>\n" +
            "  <body class style='background-color: #eaebed; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>\n" +
            "    <table role='presentation' border='0' cellpadding='0' cellspacing='0' class='body' style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; background-color: #eaebed; width: 100%;' width='100%' bgcolor='#eaebed'>\n" +
            "      <tr>\n" +
            "        <td style='font-family: sans-serif; font-size: 14px; vertical-align: top;' valign='top'>&nbsp;</td>\n" +
            "        <td class='container' style='font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; Margin: 0 auto;' width='580' valign='top'>\n" +
            "          <div class='header' style='padding: 20px 0;'>\n" +
            "            <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; width: 100%;'>\n" +
            "              <tr>\n" +
            "                <td class='align-center' width='100%' style='font-family: sans-serif; font-size: 14px; vertical-align: top; text-align: center;' valign='top' align='center'>\n" +
            "                  <a href='" + getDeploymentUrl() + "' style='color: #ec0867; text-decoration: underline;'><img src='https://cdn.discordapp.com/attachments/512987829970665482/1157674014593011833/Untitled-_1_.png' height='100' alt='MudahMail' style='border: none; -ms-interpolation-mode: bicubic; max-width: 100%;'></a>\n" +
            "                </td>\n" +
            "              </tr>\n" +
            "            </table>\n" +
            "          </div>\n" +
            "          <div class='content' style='box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;'>\n" +
            "\n" +
            "            <!-- START CENTERED WHITE CONTAINER -->\n" +
            "            <span class='preheader' style='color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;'>Verify Your MudahMail Account.</span>\n" +
            "            <table role='presentation' class='main' style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; background: #ffffff; border-radius: 3px; width: 100%;' width='100%'>\n" +
            "\n" +
            "              <!-- START MAIN CONTENT AREA -->\n" +
            "              <tr>\n" +
            "                <td class='wrapper' style='font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;' valign='top'>\n" +
            "                  <table role='presentation' border='0' cellpadding='0' cellspacing='0' style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; width: 100%;' width='100%'>\n" +
            "                    <tr>\n" +
            "                      <td style='font-family: sans-serif; font-size: 14px; vertical-align: top;' valign='top'>\n" +
            "                        <p style='font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;'>Hello user.</p>\n" +
            "                        <p style='font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;'>Welcome to MudahMail! To get started, please click the button below to verify your account.</p>\n" +
            "                        <p style='font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;'>Your verification link will expire in 24 hours.</p>\n" +
            "                        <p style='font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;'>If you didn't create a MudahMail account or got this email by mistake, please ignore this email.</p>\n" +
            "                        <table role='presentation' border='0' cellpadding='0' cellspacing='0' class='btn btn-primary' style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; box-sizing: border-box; width: 100%;' width='100%'>\n" +
            "                          <tbody>\n" +
            "                            <tr>\n" +
            "                              <td align='center' style='font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;' valign='top'>\n" +
            "                                <table role='presentation' border='0' cellpadding='0' cellspacing='0' style='border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: auto; width: auto;'>\n" +
            "                                  <tbody>\n" +
            "                                    <tr>\n" +
            "                                      <td style='font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #ec0867;' valign='top' align='center' bgcolor='#ec0867'> <a href='" + real_token + "' target='_blank' style='border: solid 1px #ec0867; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #ec0867; border-color: #ec0867; color: #ffffff;'>Verify email</a> </td>\n" +
            "                                    </tr>\n" +
            "                                  </tbody>\n" +
            "                                </table>\n" +
            "                              </td>\n" +
            "                            </tr>\n" +
            "                          </tbody>\n" +
            "                        </table>\n" +
            "                        <p style='font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;'>Alternatively, you can click on this link: " + real_token + "</p>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            "                  </table>\n" +
            "                </td>\n" +
            "              </tr>\n" +
            "            </table>\n" +
            "          </div>\n" +
            "        </td>\n" +
            "        <td style='font-family: sans-serif; font-size: 14px; vertical-align: top;' valign='top'>&nbsp;</td>\n" +
            "      </tr>\n" +
            "    </table>\n" +
            "  </body>\n" +
            "</html>",
    });
}