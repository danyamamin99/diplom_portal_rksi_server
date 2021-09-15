module.exports = (email, token) => {
  return {
    to: email,
    subject: "Восстановление доступа",
    html: `
      <h2>Забыли пароль?</h2>
      <p>Если вы не хотели менять пароль, проигнорируйте сообщение</p>
      <p>Иначе, перейдите по ссылки ниже:</p>
      <a href="http://poks42.ml:3000/pages/resetPassword/${token}">Восстановить доступ</a>
    `
  }
};