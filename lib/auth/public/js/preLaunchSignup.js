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
  const first_name = $('#first-name').val();
  const last_name = $('#last-name').val();

  return AuthSDK()
    .preLaunchSignup({ email, first_name, last_name })
    .then(() => {
      $('#success').text('Thanks for signing up to the pre-launch!');
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

  const isValid = email && first_name;

  if (isValid) {
    $('button').prop('disabled', false);
  } else {
    $('button').prop('disabled', true);
  }

  return isValid;
}
