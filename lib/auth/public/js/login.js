$(function() {
  $('form').on('keyup', () => validate());

  $('button').on('click', (e) => submit(e));
  $('form').on('submit', (e) => submit(e));
});

function submit(e) {
  e.preventDefault();

  if (!validate()) {
    return;
  }

  $('#success').text('');
  $('#error').text('');
  $('#button').prop('disabled', true);

  const email = $('#email').val();
  const password = $('#password').val();

  return AuthSDK()
    .login({ email, password })
    .then(() => {
      window.location.href = '/app';
    })
    .catch((error) => {
      console.error(error);
      if (error?.code > 500) {
        return $('#error').text('Some error ocurred. Please contact the administrator.');
      }
      $('#error').text(error?.message || 'Some error ocurred. Please contact the administrator.');
    })
    .finally(() => {
      $('#button').prop('disabled', false);
    });
}

function validate() {
  const password = $('#password').val();
  const email = $('#email').val();

  const isValid = password.length >= 8 && email;

  if (isValid) {
    $('button').prop('disabled', false);
  } else {
    $('button').prop('disabled', true);
  }

  return isValid;
}
