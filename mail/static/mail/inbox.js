document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



/////////////////////////////////////////

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#individual-email-view').style.display = 'none';
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
  }
    
  //Handlig the submission of the form
  document.querySelector("#compose-form").onsubmit = () => {

    //Getting the values typed in the form
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    console.log(typeof body);

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
  

}


/////////////////////////////////////////

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#individual-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Getting emails list for this mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //print array in console
    //console.log(emails);

    //display each email
    emails.forEach(element => display_email_mailbox(element, mailbox));
  })
}




/////////////////////////////////////////

function display_email_mailbox(element, mailbox){

  //creating div for each email and add event listener for when it is clicked
  let div_email = document.createElement('div');
  div_email.addEventListener('click', () => display_email_full(element, mailbox));

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



/////////////////////////////////////////

function display_email_full(element, mailbox){

  // Show the individual-email-view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#individual-email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //filling elements of the view
  document.querySelector('#individual-email-sender').innerHTML = `From: ${element.sender}`;
  document.querySelector('#individual-email-recipients').innerHTML = "To:";
  element.recipients.forEach(recipient => {
    document.querySelector('#individual-email-recipients').append(` ${recipient};`)
  });
  document.querySelector('#individual-email-subject').innerHTML = `Subject: ${element.subject}`;
  document.querySelector('#individual-email-time').innerHTML = `Time: ${element.timestamp}`;
  document.querySelector('#individual-email-body').innerHTML = `${element.body}`;

  //empty button-container div by default
  document.querySelector('#button-container').innerHTML= "";

  //Set archive button if mailbox is not 'sent'
  if(mailbox !== 'sent'){
    const archive_button = document.createElement('button');
    archive_button.className = "btn btn-outline-secondary btn-sm";
    if (element.archived === false){
      archive_button.innerHTML = "Archive";
    }else{
      archive_button.innerHTML = "Unarchive";
    }
    archive_button.addEventListener('click', () => archive_action(element));
    document.querySelector('#button-container').append(archive_button);
  }

   //Set reply button
   const reply_button = document.createElement('button');
   reply_button.className = "btn btn-outline-secondary btn-sm";
   reply_button.innerHTML = "Reply";
   reply_button.addEventListener('click', () => reply(element));
   document.querySelector('#button-container').append(reply_button);
   
  
  //Mark email as read
  fetch(`/emails/${element.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  //console.log(element)
}


/////////////////////////////////////////

function archive_action(element){
    fetch(`/emails/${element.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !element.archived
      })
    })
    .then(() =>{
      //After archiving/unarchiving load inbox view
      load_mailbox('inbox');
    }
    )
}


/////////////////////////////////////////

function reply(element){

  //First render  email composition form
  compose_email();

  // Prefill recipients
  document.querySelector('#compose-recipients').value = element.sender;
  document.querySelector('#compose-submit').disabled = false;

  //prefill subject
  if(element.subject.startsWith("Re:")){
    document.querySelector('#compose-subject').value = element.subject;
  }else{
    document.querySelector('#compose-subject').value = `Re: ${element.subject}`;
  }

  //prefil body
  const line = `\n \n On ${element.timestamp} ${element.sender} wrote: \n \n`
  document.querySelector('#compose-body').value = `${line} ${element.body}`;
}