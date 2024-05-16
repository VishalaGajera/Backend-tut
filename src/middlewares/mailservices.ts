import nodemailer, { Transporter } from "nodemailer";

const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vishalagajera@gmail.com',
        pass: 'aiwzyftarolruzpp'
    }
});

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

const sendMail = async (from: string, subject: string, html: string): Promise<{ success: boolean; message: string }> => {
    try {
        const mailOptions: MailOptions = {
            from,
            to: "vishalagajera@gmail.com",
            subject,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true, message: 'Email sent successfully' };
    } catch(error) {
        console.error(error);
        return { success: false, message: 'Error sending email' };
    }
}

export { sendMail };
