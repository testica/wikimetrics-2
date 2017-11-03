from flask import Flask, jsonify, request, abort, Response
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from pymongo import MongoClient, ASCENDING
import hashlib
import json
import datetime

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=30)

# jwt instance
jwt = JWTManager(app)

# mongo instance
# mongodb://api:api@ds227865.mlab.com:27865/wiki-history-api
mongo = MongoClient('ds227865.mlab.com', 27865)['wiki-history-api']
mongo.authenticate('api', 'api')


def md5(my_string):
  m = hashlib.md5()
  m.update(my_string.encode('utf-8'))
  return m.hexdigest()


@app.route('/')
def index():
  return "Hello World!"


# new user
@app.route('/sign-up', methods=['POST'])
def signUp():
  if not request.json or not 'username' in request.json or not 'password' in request.json:
    abort(400)

  username = request.json['username']
  password =  request.json['password']
  
  # check if exists
  user_exist = mongo.configurations.find_one({'user.username': username})
  if user_exist is not None:
    abort(406)
  
  config_id = mongo.configurations.insert({'user': {'username': username, 'password': md5(password)}})
  
  config = mongo.configurations.find_one({'_id': config_id })

  return jsonify(access_token = create_access_token(identity=config['user']['username']))

# sign-in user
@app.route('/sign-in', methods=['POST'])
def signIn():
  if not request.json or not 'username' in request.json or not 'password' in request.json:
    abort(400)

  username = request.json['username']
  password =  request.json['password']
  config = mongo.configurations.find_one({'user': {'username': username, 'password': md5(password)}})
  
  if config is None:
    abort(404)

  return jsonify(access_token = create_access_token(identity=config['user']['username']))



# get articles
@app.route('/articles', methods=['GET'])
@jwt_required
def get_articles():
  current_username = get_jwt_identity()
  config = mongo.configurations.find_one({'user.username': current_username})
  if not 'articles' in config:
    config['articles'] = []
  
  return jsonify(config['articles'])

# new article
# https://es.wiktionary.org/w/api.php?action=opensearch&format=json&search=Vene&namespace=0&limit=10
# https://es.wiktionary.org/w/api.php?action=query&format=json&titles=Venezuela
@app.route('/articles', methods=['POST'])
@jwt_required
def new_article():
  current_username = get_jwt_identity()
  
  if not request.json or not 'title' in request.json or not 'pageid' in request.json or not 'url' in request.json:
    abort(400)

  title = request.json['title']
  pageid = request.json['pageid']
  url = request.json['url'] 

  # check if exists
  article_exist = mongo.configurations.find_one({'user.username': current_username, 'articles': { '$elemMatch': { 'pageid': pageid}}})
  if article_exist is not None:
    abort(404)
  config = mongo.configurations.update({'user.username': current_username}, {'$push': {'articles': {'title': title, 'pageid': pageid, 'url': url}}})
  if config['nModified'] == 1:
    return jsonify({'title': title, 'pageid': pageid, 'url': url}), 201

# remove article
@app.route('/articles/<int:id>', methods=['DELETE'])
@jwt_required
def delete_article(id):
  current_username = get_jwt_identity()
  # check if exists
  article_exist = mongo.configurations.find_one({'user.username': current_username, 'articles': { '$elemMatch': { 'pageid': id}}})
  if article_exist is None:
    abort(404)
  config = mongo.configurations.update({'user.username': current_username}, {'$pull': {'articles': { 'pageid': id}}})
  if config['nModified'] == 1:
    return '', 204



if __name__ == '__main__':
  app.run(debug=True)