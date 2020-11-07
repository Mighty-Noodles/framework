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

  const id = $('body').data('id');
  const token = $('body').data('token');
  const password = $('#password').val();
  const password_confirmation = $('#password-confirmation').val();

  return AuthSDK()
    .confirmEarlyAccessSignup({ id, token, password, password_confirmation })
    .then(() => {
      location.href = '/login';
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
  const passwordConfirmation = $('#password-confirmation').val();

  const isValid = password.length >= 8;
  const matches = password === passwordConfirmation;

  if (isValid && matches) {
    $('button').prop('disabled', false);
  } else {
    $('button').prop('disabled', true);
  }

  return isValid && matches;
}
