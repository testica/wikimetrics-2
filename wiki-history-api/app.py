from flask import Flask, jsonify, request, abort, Response
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING
import hashlib
import json
import datetime

app = Flask(__name__)

# allow CORS
CORS(app)

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


# get article
@app.route('/articles/<string:title>/<string:locale>', methods=['GET'])
@jwt_required
def get_article(title, locale):
  current_username = get_jwt_identity()
  # check if exists
  article_exist = mongo.configurations.find_one({'user.username': current_username, 'articles': { '$elemMatch': { 'title': title, 'locale': locale }}})
  if article_exist is None:
    abort(404)
    # get specific article
  article_exist = (item for item in article_exist['articles'] if item['title'] == title and item['locale'] == locale).next()
  return jsonify(article_exist)


# new article
@app.route('/article', methods=['POST'])
@jwt_required
def new_article():
  current_username = get_jwt_identity()
  
  if (not request.json or
      not 'title' in request.json or
      not 'locale' in request.json or
      not 'extract' in request.json or not 'id' in request.json['extract']):
    abort(400)

  title = request.json['title']
  locale = request.json['locale']
  extract_id = request.json['extract']['id']

  # check if exists
  article_exist = mongo.configurations.find_one({'user.username': current_username, 'articles': { '$elemMatch': { 'title': title, 'locale': locale }}})
  if article_exist is not None:
    abort(409)
  config = mongo.configurations.update(
    {'user.username': current_username}, {'$push': {'articles': {'title': title, 'locale': locale, 'extract': { 'id': extract_id, 'status': 'pending' }}}}
  )
  if config['nModified'] == 1:
    return jsonify({'title': title, 'locale': locale, 'extract': { 'id': extract_id, 'status': 'pending' }}), 201
  abort(409)


# update article status
@app.route('/article/<string:title>/<string:locale>/status/<string:status>', methods=['PATCH'])
@jwt_required
def update_article(title, locale, status):
  current_username = get_jwt_identity()
  
  if status != 'pending' and status != 'failure' and status != 'success' and status != 'in progress':
    abort(400)

  # check if exists
  article_exist = mongo.configurations.find_one({'user.username': current_username, 'articles': { '$elemMatch': { 'title': title, 'locale': locale }}})
  if article_exist is None:
    abort(404)
  config = mongo.configurations.update({'user.username': current_username, 'articles.title': title, 'articles.locale': locale }, {'$set': {'articles.$.extract.status': status}})
  # get specific article
  article_exist = (item for item in article_exist['articles'] if item['title'] == title and item['locale'] == locale).next()
  if config['nModified'] == 1:
    article_exist['extract']['status'] = status
    return jsonify(article_exist), 201
  return jsonify(article_exist), 200

# remove article
@app.route('/article/<string:title>/<string:locale>', methods=['DELETE'])
@jwt_required
def delete_article(title, locale):
  current_username = get_jwt_identity()
  # check if exists
  article_exist = mongo.configurations.find_one({'user.username': current_username, 'articles': { '$elemMatch': { 'title': title, 'locale': locale }}})
  if article_exist is None:
    abort(404)
  config = mongo.configurations.update({'user.username': current_username}, {'$pull': {'articles': { 'title': title, 'locale': locale }}})
  if config['nModified'] == 1:
    return '', 204

# create visualization
@app.route('/article/<string:title>/<string:locale>/visualization', methods=['POST'])
@jwt_required
def create_visualization(title, locale):
  current_username = get_jwt_identity()

  if not request.json or not 'title' in request.json:
    abort(400)
  
  # check if exists
  article_exist = mongo.configurations.find_one({'user.username': current_username, 'articles': { '$elemMatch': { 'title': title, 'locale': locale }}})
  if article_exist is None:
    abort(404)
  
  title_vis = request.json['title']

  if (not 'description' in request.json):
    description_vis = ''
  else:
    description_vis = request.json['description']

  
  if (not 'query' in request.json):
    query_vis = ''
  else:
    query_vis = request.json['query']

  if (not 'type' in request.json):
    type_vis = ''
  else:
    type_vis = request.json['type']

  # check if exists
  vis_exist = mongo.configurations.find_one({
    'user.username': current_username,
    'articles': { '$elemMatch': { 'title': title, 'locale': locale, 'visualizations.{0}'.format(title_vis): { '$exists': True }  }}
  })
  if vis_exist is not None:
    abort(409)

  config = mongo.configurations.update(
    {'user.username': current_username, 'articles.title': title, 'articles.locale': locale },
    {'$set': { 'articles.$.visualizations.{0}'.format(title_vis): { 'description': description_vis, 'query': query_vis, 'type': type_vis } } }
  )
  if config['nModified'] == 1:
    return jsonify({'title': title_vis, 'description': description_vis, 'query': query_vis}), 201
  abort(409)

# update visualization
@app.route('/article/<string:title>/<string:locale>/visualization', methods=['patch'])
@jwt_required
def update_visualization(title, locale):
  current_username = get_jwt_identity()

  if not request.json or not 'title' in request.json or not 'description' in request.json or not 'query' in request.json or not 'type' in request.json:
    abort(400)

  # check if exists
  article_exist = mongo.configurations.find_one({'user.username': current_username, 'articles': { '$elemMatch': { 'title': title, 'locale': locale }}})
  if article_exist is None:
    abort(404)

  title_vis = request.json['title']

  if (not 'description' in request.json):
    description_vis = ''
  else:
    description_vis = request.json['description']

  if (not 'query' in request.json):
    query_vis = ''
  else:
    query_vis = request.json['query']

  if (not 'type' in request.json):
    type_vis = ''
  else:
    type_vis = request.json['type']

  # check if exists
  vis_exist = mongo.configurations.find_one({
    'user.username': current_username,
    'articles': { '$elemMatch': { 'title': title, 'locale': locale, 'visualizations.{0}'.format(title_vis): { '$exists': True }  }}
  })
  if vis_exist is None:
    abort(409)

  config = mongo.configurations.update(
    {'user.username': current_username, 'articles.title': title, 'articles.locale': locale },
    {'$set': { 'articles.$.visualizations.{0}'.format(title_vis): { 'description': description_vis, 'query': query_vis, 'type': type_vis } } }
  )

  if config['nModified'] == 1:
    return jsonify({'title': title_vis, 'description': description_vis, 'query': query_vis, 'type': type_vis}), 201
  abort(409)


if __name__ == '__main__':
  app.run(debug=True)