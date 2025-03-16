const emaildatavar = {};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch email data
    await fetch('/api/emailjs')
      .then(response => response.json())
      .then(data => {
        emaildatavar.EMAILJS_PUBLIC_KEY = data.EMAILJS_PUBLIC_KEY;
        emaildatavar.EMAILJS_SERVICE_ID = data.EMAILJS_SERVICE_ID;
        emaildatavar.EMAILJS_TEMPLATE_ID = data.EMAILJS_TEMPLATE_ID;
      })
      .catch(error => {
        console.error('Error fetching email data:', error);
        throw new Error('Failed to initialize email data.');
      });

    // Initialize AOS and EmailJS after fetching data
    AOS.init();
    emailjs.init(emaildatavar.EMAILJS_PUBLIC_KEY); // Now the key is available
  } catch (error) {
    console.error('Initialization failed:', error);
  }
});

// Handle form submission
document.getElementById("contact-form").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent default form submission

  // Get form values
  const name = document.getElementById("namejs").value.trim();
  const email = document.getElementById("emailjs").value.trim();
  const message = document.getElementById("message").value.trim();

  // Error elements
  const statusElement = document.getElementById("status");

  // Reset status message
  statusElement.innerText = "";
  statusElement.style.color = "red"; 

  // Validation checks
  if (!/^[A-Za-z\s]+$/.test(name)) {
    statusElement.innerText = "Please enter a valid name (letters and spaces only).";
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    statusElement.innerText = "Please enter a valid email address.";
    return;
  }

  if (message === "") {
    statusElement.innerText = "Message cannot be empty.";
    return;
  }

  // Prepare the data for EmailJS
  const templateParams = {
    from_name: name,
    from_email: email,
    message: message,
  };

  try {
    // Send the email using EmailJS
    const response = await emailjs.send(
      emaildatavar.EMAILJS_SERVICE_ID,
      emaildatavar.EMAILJS_TEMPLATE_ID,
      templateParams
    );

    // Save to the database
    const savetodb = await fetch('/api/contactus', {
      method: 'POST',
      body: JSON.stringify(templateParams),
      headers: { 'Content-Type': 'application/json' },
    });

    if (savetodb.ok) {
      statusElement.style.color = "green";
      statusElement.innerText = "Your message has been sent successfully!";
      document.getElementById("namejs").value = "";
      document.getElementById("emailjs").value = "";
      document.getElementById("message").value = "";
    } else {
      throw new Error('Failed to save message to database.');
    }
  } catch (error) {
    console.error('Error sending email or saving to DB:', error);
    statusElement.innerText = "There was an error sending your message. Please try again later.";
  }
});
