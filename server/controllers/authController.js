const User = require("../models/User");
const bcrypt = require("bcrypt");
const validator = require("validator");
const transporter = require("../config/email");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Bill = require("../models/Bill");
const Saving = require("../models/Saving");
const SavingTransaction = require("../models/SavingTransaction");
const jwt = require("jsonwebtoken");

// =====================================================
// REGISTER
// =====================================================

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      gender,
      phone,
      email,
      password,
    } = req.body;

    // Verificăm câmpurile obligatorii
    if (
      !firstName ||
      !lastName ||
      !birthDate ||
      !gender ||
      !phone ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Completează toate câmpurile obligatorii.",
      });
    }

    // Validare email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Adresa de email nu este validă.",
      });
    }

    // Validare telefon
    const phoneRegex = /^[0-9+\s()-]{8,20}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Numărul de telefon nu este valid.",
      });
    }

    // Validare parolă
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Parola trebuie să aibă minimum 6 caractere.",
      });
    }

    // Verificăm dacă există emailul
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Există deja un cont cu acest email.",
      });
    }

    // Verificăm dacă există telefonul
    const existingPhone = await User.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message:
          "Există deja un cont cu acest număr de telefon.",
      });
    }

    // Generăm cod de 6 cifre
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Cod valabil 10 minute
    const verificationCodeExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Criptăm parola
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Creăm utilizatorul
    const user = await User.create({
      firstName,
      lastName,
      birthDate,
      gender,
      phone,
      email: email.toLowerCase(),
      password: hashedPassword,

      isVerified: false,

      verificationCode,
      verificationCodeExpire,
    });

    // =====================================================
    // TRIMITEM CODUL PE EMAIL
    // =====================================================

    try {
      await transporter.sendMail({
        from: `"Application Budget" <${process.env.EMAIL_FROM}>`,
        to: user.email,

        subject:
          "Cod de verificare - Application Budget",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              background-color: #f7f9fc;
              border-radius: 12px;
            "
          >

            <h2 style="color: #1976d2;">
              Application Budget
            </h2>

            <p>
              Bună, <strong>${user.firstName}</strong>!
            </p>

            <p>
              Ai creat un cont în Application Budget.
              Pentru a confirma adresa de email,
              introdu următorul cod în aplicație:
            </p>

            <div
              style="
                background-color: white;
                padding: 20px;
                text-align: center;
                border-radius: 10px;
                margin: 25px 0;
              "
            >

              <div
                style="
                  font-size: 36px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #1976d2;
                "
              >
                ${verificationCode}
              </div>

            </div>

            <p>
              Codul este valabil timp de
              <strong>10 minute</strong>.
            </p>

            <p style="color: #777;">
              Dacă nu tu ai creat acest cont,
              poți ignora acest mesaj.
            </p>

          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Eroare la trimiterea emailului:",
        emailError
      );

      // Dacă emailul nu poate fi trimis,
      // ștergem contul creat pentru a putea încerca din nou
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message:
          "Contul nu a putut fi creat deoarece emailul de verificare nu a putut fi trimis.",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Contul a fost creat. Am trimis codul de verificare pe email.",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Eroare register:", error);

    return res.status(500).json({
      success: false,
      message: "Eroare server.",
    });
  }
};

// =====================================================
// VERIFICARE EMAIL
// =====================================================

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message:
          "Emailul și codul sunt obligatorii.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizatorul nu a fost găsit.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Emailul este deja verificat.",
      });
    }

    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message:
          "Nu există un cod de verificare activ.",
      });
    }

    if (
      user.verificationCodeExpire &&
      user.verificationCodeExpire < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Codul de verificare a expirat.",
      });
    }

    if (
      user.verificationCode !== String(code)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Codul de verificare este incorect.",
      });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;

    await user.save();

    return res.json({
      success: true,
      message:
        "Email verificat cu succes! Acum te poți autentifica.",
    });
  } catch (error) {
    console.error(
      "Eroare verifyEmail:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Eroare server.",
    });
  }
};
// =====================================================
// RETRIMITE CODUL DE VERIFICARE
// =====================================================

exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Adresa de email nu este validă.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizatorul nu a fost găsit.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Adresa de email este deja verificată.",
      });
    }

    // Generăm un cod nou
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Noul cod expiră în 10 minute
    user.verificationCode = verificationCode;
    user.verificationCodeExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    // Trimitem noul cod
    await transporter.sendMail({
      from: `"Application Budget" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject:
        "Cod nou de verificare - Application Budget",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
          "
        >
          <h2>Application Budget</h2>

          <p>
            Bună, <strong>${user.firstName}</strong>!
          </p>

          <p>
            Ai solicitat un nou cod pentru
            verificarea adresei de email.
          </p>

          <div
            style="
              padding: 20px;
              text-align: center;
              margin: 25px 0;
              background: #f5f5f5;
              border-radius: 10px;
            "
          >
            <div
              style="
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
              "
            >
              ${verificationCode}
            </div>
          </div>

          <p>
            Codul este valabil timp de
            <strong>10 minute</strong>.
          </p>

          <p>
            Codul anterior nu mai poate fi utilizat.
          </p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message:
        "Un nou cod de verificare a fost trimis pe email.",
    });
  } catch (error) {
    console.error(
      "Eroare resendVerificationCode:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Codul de verificare nu a putut fi retrimis.",
    });
  }
};
// =====================================================
// AI UITAT PAROLA - TRIMITE COD PE EMAIL
// =====================================================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificăm dacă emailul a fost introdus
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Adresa de email este obligatorie.",
      });
    }

    // Verificăm formatul emailului
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Adresa de email nu este validă.",
      });
    }

    // Căutăm utilizatorul
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Nu există niciun cont asociat acestei adrese de email.",
      });
    }

    // Generăm cod de 6 cifre
    const resetCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Salvăm codul
    user.resetPasswordCode = resetCode;

    // Codul expiră în 10 minute
    user.resetPasswordCodeExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    // Trimitem codul prin email
    try {
      await transporter.sendMail({
        from: `"Application Budget" <${process.env.EMAIL_FROM}>`,

        to: user.email,

        subject:
          "Cod pentru resetarea parolei - Application Budget",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              background-color: #f7f9fc;
              border-radius: 12px;
            "
          >
            <h2 style="color: #1976d2;">
              Application Budget
            </h2>

            <h3>
              🔐 Resetarea parolei
            </h3>

            <p>
              Bună,
              <strong>${user.firstName}</strong>!
            </p>

            <p>
              Am primit o solicitare pentru
              resetarea parolei contului tău.
            </p>

            <p>
              Codul tău de verificare este:
            </p>

            <div
              style="
                background: white;
                padding: 20px;
                text-align: center;
                border-radius: 10px;
                margin: 25px 0;
              "
            >
              <div
                style="
                  font-size: 36px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #1976d2;
                "
              >
                ${resetCode}
              </div>
            </div>

            <p>
              Codul este valabil timp de
              <strong>10 minute</strong>.
            </p>

            <p>
              Dacă nu ai solicitat resetarea parolei,
              poți ignora acest email.
            </p>
          </div>
        `,
      });

      console.log(
        `Cod resetare parolă trimis către ${user.email}`
      );
    } catch (emailError) {
      console.error(
        "Eroare la trimiterea codului de resetare:",
        emailError
      );

      // Dacă emailul nu s-a trimis,
      // eliminăm codul salvat.
      user.resetPasswordCode = null;
      user.resetPasswordCodeExpire = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Codul pentru resetarea parolei nu a putut fi trimis.",
      });
    }

    return res.json({
      success: true,
      message:
        "Codul pentru resetarea parolei a fost trimis pe email.",
    });
  } catch (error) {
    console.error(
      "Eroare forgotPassword:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Eroare server.",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Emailul și parola sunt obligatorii.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Adresa de email nu este validă.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Email sau parolă incorectă.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Email sau parolă incorectă.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Trebuie să îți verifici adresa de email înainte de autentificare.",
      });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
      
    );
    
    // =====================================================
// EMAIL ALERTĂ AUTENTIFICARE
// =====================================================

try {
  const loginDate = new Date().toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
  });

  await transporter.sendMail({
    from: `"Application Budget" <${process.env.EMAIL_FROM}>`,
    to: user.email,

    subject: "Autentificare în contul Application Budget",

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background-color: #f7f9fc;
          border-radius: 12px;
        "
      >
        <h2 style="color: #1976d2;">
          Application Budget
        </h2>

        <h3>
          🔐 Autentificare în cont
        </h3>

        <p>
          Bună, <strong>${user.firstName}</strong>!
        </p>

        <p>
          A fost efectuată o autentificare în
          contul tău Application Budget.
        </p>

        <div
          style="
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          "
        >
          <p>
            <strong>Data și ora:</strong>
            ${loginDate}
          </p>
        </div>

        <p>
          Dacă tu ai efectuat autentificarea,
          nu trebuie să faci nimic.
        </p>

        <p style="color: #d32f2f;">
          <strong>
            Dacă nu recunoști această activitate,
            îți recomandăm să îți schimbi parola.
          </strong>
        </p>
      </div>
    `,
  });
} catch (emailError) {
  console.error(
    "Emailul de alertă login nu a putut fi trimis:",
    emailError
  );

  // IMPORTANT:
  // nu blocăm autentificarea dacă emailul
  // de avertizare nu poate fi trimis.
}

    return res.json({
      success: true,
      message: "Autentificare reușită!",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        gender: user.gender,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Eroare login:", error);

    return res.status(500).json({
      success: false,
      message: "Eroare server.",
    });
  }
};
// =====================================================
// VERIFICĂ CODUL PENTRU RESETAREA PAROLEI
// =====================================================

exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Emailul și codul sunt obligatorii.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizatorul nu a fost găsit.",
      });
    }

    if (!user.resetPasswordCode) {
      return res.status(400).json({
        success: false,
        message: "Nu există un cod activ pentru resetarea parolei.",
      });
    }

    if (
      user.resetPasswordCodeExpire &&
      user.resetPasswordCodeExpire < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Codul pentru resetarea parolei a expirat.",
      });
    }

    if (user.resetPasswordCode !== String(code)) {
      return res.status(400).json({
        success: false,
        message: "Codul introdus este incorect.",
      });
    }
    
    return res.json({
      success: true,
      message: "Cod verificat cu succes.",
    });
    
    } catch (error) {
      console.error("Eroare verifyResetCode:", error);
    
      return res.status(500).json({
        success: false,
        message: "Eroare server.",
      });
    }
    };
    
    // =====================================================
    // CONFIRMĂ ȘI ȘTERGE CONTUL
    // =====================================================
// =====================================================
// CONFIRMĂ ȘI ȘTERGE CONTUL
// =====================================================

exports.confirmDeleteAccount = async (req, res) => {
  try {
    const { code } = req.body;

    const userId = req.user._id;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        message:
          "Utilizatorul și codul sunt obligatorii.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizatorul nu a fost găsit.",
      });
    }

    // Verificăm codul
    if (
      !user.deleteAccountCode ||
      user.deleteAccountCode !== String(code)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Codul pentru ștergerea contului este incorect.",
      });
    }

    // Verificăm expirarea
    if (
      !user.deleteAccountCodeExpire ||
      user.deleteAccountCodeExpire < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Codul pentru ștergerea contului a expirat.",
      });
    }

    // =====================================================
    // GĂSIM ECONOMIILE UTILIZATORULUI
    // =====================================================

    const savings = await Saving.find({
      user: user._id,
    }).select("_id");

    const savingIds = savings.map(
      (saving) => saving._id
    );

    // =====================================================
    // ȘTERGEM TRANZACȚIILE ECONOMIILOR
    // =====================================================

    if (savingIds.length > 0) {
      await SavingTransaction.deleteMany({
        saving: {
          $in: savingIds,
        },
      });
    }

    // =====================================================
// ȘTERGEM RESTUL DATELOR
// =====================================================

await Promise.all([
  Income.deleteMany({
    user: user._id,
  }),

  Expense.deleteMany({
    user: user._id,
  }),

  Bill.deleteMany({
    user: user._id,
  }),

  Saving.deleteMany({
    user: user._id,
  }),
]);

// =====================================================
// ȘTERGEM UTILIZATORUL
// =====================================================

await User.findByIdAndDelete(user._id);

return res.json({
  success: true,
  message:
    "Contul și toate datele asociate au fost șterse definitiv.",
});

} catch (error) {

  console.error(
    "Eroare confirmDeleteAccount:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Contul nu a putut fi șters.",
  });
}
};


// =====================================================
// ACTUALIZARE PROFIL
// =====================================================

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      gender,
      phone,
    } = req.body;
    
    const userId = req.user._id;

    if (
      !firstName ||
      !lastName ||
      !birthDate ||
      !gender ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Completează toate câmpurile.",
      });
    }

    if (
      !["male", "female", "other"].includes(gender)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valoarea pentru sex nu este validă.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Utilizatorul nu a fost găsit.",
      });
    }

    // Verificăm dacă telefonul este folosit
    // de alt utilizator
    const existingPhone = await User.findOne({
      phone: phone.trim(),

      _id: {
        $ne: userId,
      },
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message:
          "Acest număr de telefon este deja asociat altui cont.",
      });
    }

    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.birthDate = birthDate;
    user.gender = gender;
    user.phone = phone.trim();

    await user.save();

    return res.json({
      success: true,
      message:
        "Profilul a fost actualizat cu succes.",

      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        gender: user.gender,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {

    console.error(
      "Eroare updateProfile:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Profilul nu a putut fi actualizat.",
    });
  }
};
//==========================================
// SOLICITĂ ȘTERGEREA CONTULUI
// =====================================================

exports.requestDeleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Utilizatorul este obligatoriu.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizatorul nu a fost găsit.",
      });
    }

    // Cod de 6 cifre
    const deleteCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Cod valabil 10 minute
    user.deleteAccountCode = deleteCode;

    user.deleteAccountCodeExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    try {
      await transporter.sendMail({
        from: `"Application Budget" <${process.env.EMAIL_FROM}>`,

        to: user.email,

        subject:
          "Confirmare ștergere cont - Application Budget",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              background-color: #f7f9fc;
              border-radius: 12px;
            "
          >
            <h2 style="color: #1976d2;">
              Application Budget
            </h2>

            <h3 style="color: #d32f2f;">
              ⚠️ Solicitare de ștergere a contului
            </h3>

            <p>
              Bună,
              <strong>${user.firstName}</strong>!
            </p>

            <p>
              Am primit o solicitare pentru
              ștergerea definitivă a contului tău.
            </p>

            <p>
              Pentru confirmare, introdu următorul cod
              în aplicație:
            </p>

            <div
              style="
                background: white;
                padding: 20px;
                text-align: center;
                border-radius: 10px;
                margin: 25px 0;
              "
            >
              <div
                style="
                  font-size: 36px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #d32f2f;
                "
              >
                ${deleteCode}
              </div>
            </div>

            <p>
              Codul este valabil timp de
              <strong>10 minute</strong>.
            </p>

            <p>
              Dacă nu ai solicitat ștergerea contului,
              ignoră acest mesaj. Contul tău nu va fi șters.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Eroare email ștergere cont:",
        emailError
      );

      user.deleteAccountCode = null;
      user.deleteAccountCodeExpire = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Codul de confirmare nu a putut fi trimis.",
      });
    }

    return res.json({
      success: true,
      message:
        "Am trimis codul de confirmare pe adresa ta de email.",
    });
  } catch (error) {
    console.error(
      "Eroare requestDeleteAccount:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Eroare server.",
    });
  }
};
// =====================================================
// RESETARE PAROLĂ
// =====================================================

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Toate câmpurile sunt obligatorii.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Parola trebuie să aibă minimum 6 caractere.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizatorul nu a fost găsit.",
      });
    }

    // Verificăm din nou codul
    if (
      !user.resetPasswordCode ||
      user.resetPasswordCode !== String(code)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Codul pentru resetarea parolei nu este valid.",
      });
    }

    // Verificăm dacă a expirat
    if (
      !user.resetPasswordCodeExpire ||
      user.resetPasswordCodeExpire < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Codul pentru resetarea parolei a expirat.",
      });
    }

    // Criptăm parola nouă
    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    // Codul nu mai poate fi folosit
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpire = null;

    await user.save();

    // =================================================
    // EMAIL DE SECURITATE
    // =================================================

    try {
      await transporter.sendMail({
        from: `"Application Budget" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject:
          "Parola contului tău a fost modificată",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              background: #f7f9fc;
              border-radius: 12px;
            "
          >
            <h2 style="color: #1976d2;">
              Application Budget
            </h2>

            <h3>🔐 Parolă modificată</h3>

            <p>
              Bună,
              <strong>${user.firstName}</strong>!
            </p>

            <p>
              Parola contului tău Application Budget
              a fost modificată cu succes.
            </p>

            <p>
              Dacă tu ai efectuat această modificare,
              nu trebuie să faci nimic.
            </p>

            <p style="color: #d32f2f;">
              <strong>
                Dacă nu ai modificat parola,
                este posibil ca altcineva să fi
                accesat contul tău.
              </strong>
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Email confirmare resetare parolă:",
        emailError
      );

      // Parola rămâne schimbată chiar dacă
      // emailul de securitate nu poate fi trimis.
    }

    return res.json({
      success: true,
      message:
        "Parola a fost schimbată cu succes.",
    });
  } catch (error) {
    console.error(
      "Eroare resetPassword:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Eroare server.",
    });
  }
};