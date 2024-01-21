const express = require("express");
const fs = require("fs");
const path = require('path');
const {Client} = require('pg');
const formidable = require('formidable');
const PORT= 8080;

var client= new Client({database:"proiect_pibd",
        user:"andreic",
        password:"1234",
        host:"localhost",
        port:5432});
client.connect();

app= express();
app.set("view engine","ejs");
app.use("/resources", express.static(__dirname+"/resources"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.get(["/"], function(req, res){
    res.render("pages/home", { pageTitle: 'Welcome to My Homepage', message: 'Hello, world!' });
});

app.get(["/view"], function(req, res){
    
    res.render("pages/view", { pageTitle: 'Welcome to My Homepage', message: 'Hello, world!' });
        
});

app.get(["/view/avocati"], function(req, res){
    client.query(
        `SELECT * FROM avocat`, function(queryErr, queryRes){
            if(queryErr){
                res.render("pages/eroare", {eroare:String(queryErr)});
            }else{
                //console.log(queryRes.rows);
                res.render("pages/avocati", {pageTitle: 'Welcome to My Homepage', entries: queryRes.rows, nr_rez:queryRes.rowCount});
            }
        });
});

app.get(["/view/contracte"], function(req, res){
    client.query(
        `SELECT * FROM contract`, function(queryErr, queryRes){
            if(queryErr){
                res.render("pages/eroare", {eroare:String(queryErr)});
            }else{
                //console.log(queryRes.rows);
                res.render("pages/contracte", {pageTitle: 'Welcome to My Homepage', entries: queryRes.rows, nr_rez:queryRes.rowCount});
            }
        });
});

app.get(["/view/clienti"], function(req, res){
    client.query(
        `SELECT * FROM client`, function(queryErr, queryRes){
            if(queryErr){
                res.render("pages/eroare", {eroare:String(queryErr)});
            }else{
                //console.log(queryRes.rows);
                res.render("pages/clienti", {pageTitle: 'Welcome to My Homepage', entries: queryRes.rows, nr_rez:queryRes.rowCount});
            }
        });
});

app.get('/add/avocat', (req, res) => {
    res.render('pages/add_avocat', {pageTitle: 'Welcome to My Homepage'});
});

app.post('/create/avocat', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Eroare');
            return;
        }

        const {
            nume,
            prenume,
            email,
            cnp,
            telefon,
            specializare,
            speta
        } = fields;

        const query = `
            INSERT INTO avocat (nume, prenume, email, cnp, telefon, specializare, speta)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        const values = [nume, prenume, email, cnp, telefon, specializare, speta];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
        });


        try {
            await client.query(query, values);
            res.redirect('/view/avocati'); // Redirect to the page displaying all entries
        } catch (error) {
            //console.error(error);
            res.render("pages/eroare", {eroare:String(error.detail)});
        }
    });
});

app.get('/add/client', (req, res) => {
    res.render('pages/add_client', {pageTitle: 'Welcome to My Homepage'});
});

app.post('/create/client', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Eroare');
            return;
        }

        const {
            nume,
            prenume,
            email,
            cnp,
            telefon,
            adresa
        } = fields;

        const query = `
            INSERT INTO client (nume, prenume, email, cnp, telefon, adresa)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const values = [nume, prenume, email, cnp, telefon, adresa];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
        });


        try {
            await client.query(query, values);
            res.redirect('/view/clienti'); // Redirect to the page displaying all entries
        } catch (error) {
            //console.error(error);
            res.render("pages/eroare", {eroare:String(error.detail)});
        }
    });
});

app.get('/add/contract', (req, res) => {
    res.render('pages/add_contract', {pageTitle: 'Welcome to My Homepage'});
});

app.post('/create/contract', async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }

        const {
            id_avocat_ctr,
            id_client_ctr,
            valoare,
            data_start,
            data_sfarsit,
            judecatorie
        } = fields;

        const query = `
            INSERT INTO contract (id_avocat_ctr, id_client_ctr, valoare, data_start, data_sfarsit, judecatorie)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        values = [id_avocat_ctr, id_client_ctr, valoare, data_start, data_sfarsit, judecatorie];

        values.forEach((element, index) => {
            const element_clean = String(element).replace(/[{}"]/g, '');
            values[index] = element_clean;
            if(index == 4 && element_clean == ''){
                values[index] = null;
            }
        });


        try {
            await client.query(query, values);
            res.redirect('/view/contracte'); // Redirect to the page displaying all entries
        } catch (error) {
            console.error(error);
            //res.status(500).send('Eroare.');
            res.render("pages/eroare", {eroare:String(error.detail)});
        }
    });
});

app.post("/delete/avocat/:id", function(req, res){
    const avocatId = req.params.id;
    console.log('Deleting avocat with id:', avocatId);
    client.query('DELETE FROM avocat WHERE id_avocat = $1', [avocatId], function(err, rez){
        if(err){
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }
        console.log('Delete successful');
        res.redirect("/view/avocati");
    });
});


app.post("/delete/client/:id", function(req, res){
    const clientId = req.params.id;
    client.query('DELETE FROM client WHERE id_client = $1', [clientId], function(err, rez){
        if(err){
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }
        console.log('Delete successful');
        res.redirect("/view/clienti");
    });
});


app.post("/delete/contract/:id", function(req, res){
    const contractId = req.params.id;
    client.query('DELETE FROM contract WHERE id_contract = $1', [contractId], function(err, rez){
        if(err){
            //console.error(err);
            res.render("pages/eroare", {eroare:String(err)});
            return;
        }
        console.log('Delete successful');
        res.redirect("/view/contracte");
    });
});


app.listen(PORT, ()=>{
    console.log(`Serverul a pornit, port: ${PORT}`);
});