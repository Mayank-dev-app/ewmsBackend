import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,   // Correct SSL Port
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    }
});

const mailOption = async (email, otp) => {
    try {
        const response = await transporter.sendMail({
            from: '"Mayank Sharma" <mayank.sharma.dev06@gmail.com>',
            to: email,
            subject: 'Verification Email',
            text: 'Your OTP Code',
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Email Verification</h2>
                    <p>Your OTP Code is:</p>
                    <h1 style="background:#eee; padding:10px; width:120px; text-align:center;">
                        ${otp}
                    </h1>
                    <p>This OTP will expire in 5 minutes.</p>
                </div>
            `,
        });

        return true;  // Email Sent

    } catch (error) {
        console.log("Mail Error:", error);
        return false; // Email Failed
    }
}

export default mailOption;
