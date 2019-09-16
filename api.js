/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var search = req.query;
      if(search._id){ search._id = new ObjectId(search._id)}

      MongoClient.connect(CONNECTION_STRING,(err,db)=>{
        db.collection(project).find(search).toArray((err,docs)=>{
          if(err)
            console.log(err);
          res.json(docs);
        });
      });
    
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var content = req.body;
      if(content.issue_title==''&&content.issue_text==''&&content.created_by==''){
        res.send('fields empty');
      }
      MongoClient.connect(CONNECTION_STRING,(err,db)=>{
        if(err)
          console.log(err);
        db.collection(project).insert({
          issue_title: content.issue_title,
          issue_text: content.issue_text,
          created_on: new Date(),
          updated_on: new Date(),
          created_by: content.created_by,
          assigned_to: content.assigned_to,
          status_text: content.status_text,
          open: true
        },(err,doc)=>{
          if(err)
            res.json(err);
          res.json(doc.ops);
        });
    
      });
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var content = req.body;
      if(validate(content)){
        MongoClient.connect(CONNECTION_STRING,(err,db)=>{
          if(err)
            console.log(err);
          var docid = content._id;
          content.updated_on = new Date();
          content.open = (Boolean(content.open)?false:true);
          delete content._id;
          //res.send(docid);
          db.collection(project).findOneAndUpdate(
            {_id: new ObjectId(docid)},
            {
              $set:content
            },
            {
              returnNewDocument: true
            },
            (err,doc)=>{
              if(err)
                console.log(err);

              if(doc.value)
                res.send('successfully updated');
              else
                res.send('could not update'); 
            }
          );
        });
        //res.send(Boolean(content.open));
      }else{
        res.send('no updated field sent');
      }
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var identity = req.body._id;
      if(identity == '')
        res.send('_id error');
    
      MongoClient.connect(CONNECTION_STRING,(err,db)=>{
        db.collection(project).deleteOne({_id: new ObjectId(identity)},(err,doc)=>{
          if(err)
            console.log(err);
          if(doc)
            res.send('successfully deleted');
          else
            res.send('could not delete');
        });
      });
    });
  
    
};

function validate(obj){
  for(var key in obj){
    if(Boolean(obj[key]) && obj[key] != obj._id){
      return true;
    }
  }
  return false;
}
