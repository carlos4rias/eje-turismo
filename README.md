# Eje-turismo

If you want to test the App an example  is running at https://ejeturismo.herokuapp.com/

|role   | email  | password  
|---|---|---|
| root  | eje@eje.eje  | 123  |
| admin   | carlos.23325@gmail.com  |  123 |
| suscriber   | caananarias@utp.edu.co  |  123 |
| suscriber   | c4rias@gmail.com  |  123 |

If you are trying to use the email features and those does not work you may see this https://stackoverflow.com/questions/27976070/nodemailer-fails-on-heroku

# Install
clone the repository
```
$ git clone https://github.com/carlos4rias/eje-turismo.git
```
install the dependencies

```
$ yarn install
```

# Run an instance
+ Be sure your mongodb server is running
+ Create a root user if you have not
```
npm init
```
+ just type
```
$ npm start
```

+ for use the (activate, pass recovery, add new marker), you must config a gmail account, do it in the ./config/utils.js file.

The app is not finish yet, was a prototype for the software laboratory subject, feel free to improve or use it.
