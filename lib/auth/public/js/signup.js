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

  const password = $('#password').val();
  const password_confirmation = $('#password-confirmation').val();
  const email = $('#email').val();
  const first_name = $('#first-name').val();
  const last_name = $('#last-name').val();

  return AuthSDK()
    .signup({ email, first_name, last_name, password, password_confirmation })
    .then(() => {
      $('#success').text('Please confirm your email');
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
  const email = $('#email').val();
  const first_name = $('#first-name').val();
  const password = $('#password').val();
  const passwordConfirmation = $('#password-confirmation').val();

  const isValid = password.length >= 8 && email && first_name;
  const matches = password === passwordConfirmation;

  if (isValid && matches) {
    $('button').prop('disabled', false);
  } else {
    $('button').prop('disabled', true);
  }

  return isValid && matches;
}
