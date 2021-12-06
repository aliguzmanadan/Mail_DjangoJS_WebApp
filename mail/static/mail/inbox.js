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

    //check if there is an error
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
        
        //if not, clear eventual error message and load user's sent mailbox after sending email.
        else{
          document.querySelector("#compose-error").innerHTML = "";
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

  //Getting emails list for this mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //print array in console
    console.log(emails);

    //display each email
    emails.forEach(element => display_email_mailbox(element));
  })
}

function display_email_mailbox(element){
  let div_email = document.createElement('div');
  div_email.addEventListener('click', () => display_email_full(element));

  //setting grey back ground if email is read, white otherwise
  if (element.read){
    div_email.className = "card text-white bg-secondary mb-3";
  }else{
    div_email.className = "card text-dark bg-light mb-3";
  }
  
  //setting content of the display
  let header = document.createElement('div');
  header.className = "card-header";
  header.innerHTML = `<h6> From: ${element['sender']}  <span style="padding-left: 100px"> Date:  ${element['timestamp']}</span> </h6>`;

  let body = document.createElement('div');
  body.className = "card-body"
  body.innerHTML = `Subject: ${element['subject']}`;

  div_email.append(header, body);

  document.querySelector("#emails-view").append(div_email);
}

function display_email_full(element){
  console.log("This element has been clicked");
}