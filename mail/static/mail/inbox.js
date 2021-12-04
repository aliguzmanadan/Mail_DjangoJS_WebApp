document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //By default the submit button is disabled
  document.querySelector("#compose-submit").disabled = true;

  //Enable submit button if there is something typed in in the recipients input
  document.querySelector('#compose-recipients').onkeyup = () => {
    if(document.querySelector('#compose-recipients').value.length > 0){
        document.querySelector('#compose-submit').disabled = false;
    }
    else{
        document.querySelector('#compose-submit').disabled = true;
    }
    
  //Handlig the submission of the form
  document.querySelector("#compose-form").onsubmit = () => {

    //Getting the values typed in the form
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    //Sending an email via POST request to the API
    fetch('/emails',{
      method: "POST",
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })

    //Put response in a JSON form a
    .then(response => response.json())

    //check if there is an errro
    .then(result => {
        const message = result.error;

        //if there is an error display a message 
        if (message !== undefined){
          let div_alert = document.createElement('div');
          div_alert.className = "alert alert-danger";
          div_alert.innerHTML = `Error: ${message}`;
          document.querySelector("#compose-error").append(div_alert);
          console.log(message);
        }
        
        //if not load user's sent mailbox after sending email.
        else{
          load_mailbox('sent');
          console.log(result);
        }
    })
    
    //Stop form from submitting
    return false;
  }
};

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}