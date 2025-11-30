
import React, {useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Welcome = () => {


  //Code for login authentication

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
           
       // Save user in localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(data.user));

            if (data.user.role === 'manager') {
                navigate('/manager-dashboard');
            } else {
                navigate('/member-dashboard');
            }
        } else {
            alert('Invalid email or password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
    }
};




  //return page
  return (
    <div>


      <section class="header">
        <div class="container">
          <nav class="navbar navbar-expand-lg navbar-light">
            <a class="navbar-brand" href="/"><img src="https://i.ya-webdesign.com/images/spiderman-logo-png-7.png" alt="" /></a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ml-auto text-right">
                <li class="nav-item">
                  <a class="nav-link active-home" href="/">Home</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/">Gallery</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/">Contact Us</a>
                </li>
              </ul>
            </div>
          </nav>

          <div class="row banner">
            <div class="col-md-6" style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>Welcome to Team Productivity Dashboard</h1>
              <p>Track tasks, manage skills, and boost productivity!</p>



              <div >
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ margin: '10px', padding: '10px' }}
                  />
                  <br />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ margin: '10px', padding: '10px' }}
                  />
                  <br />
                  <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
                </form>
              </div>


            </div>
            <div class="col-md-6">
              <img src="http://www.pngall.com/wp-content/uploads/2016/05/Spider-Man-PNG-Picture.png" alt="" class="img-fluid" />
            </div>
          </div>
        </div>
      </section>







    </div>
  );
};

export default Welcome;
