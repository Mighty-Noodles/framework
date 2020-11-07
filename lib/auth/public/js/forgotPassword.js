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

  return AuthSDK()
    .forgotPassword({ email })
    .then(() => {
      $('#success').text('Please follow theinstructions in your email. It may take some minutes. You may need to check your spam box.');
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

  if (email) {
    $('button').prop('disabled', false);
  } else {
    $('button').prop('disabled', true);
  }

  return !!email;
}
