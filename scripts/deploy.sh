#!/usr/bin/env bash
set -e

info() { echo "$0: $1"; }
error() { info "$1"; exit 1; }
deploy() { info "Deploying $1 build"; }

decode_ssh_key() {
  echo -n $id_rsa_{00..30} >> ~/.ssh/id_rsa_base64
  base64 --decode --ignore-garbage ~/.ssh/id_rsa_base64 > ~/.ssh/id_rsa
  chmod 600 ~/.ssh/id_rsa
  echo -e "Host $1\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
}

# Only deploy on non-forks
[[ "$TRAVIS_REPO_SLUG" == "eHealthAfrica/sense-ebola-dashboard" ]] || exit 1

# Do not deploy pull requests
[[ "$TRAVIS_PULL_REQUEST" == "false" ]] || exit 1

dist="dist"
[[ -d "$dist" ]] || error "$dist: no such directory"

if [[ "$TRAVIS_BRANCH" == "master" ]]; then
  deploy "release"
  host="54.75.128.38"
elif [[ "$TRAVIS_BRANCH" == "develop" ]]; then
  deploy "stage"
  host="54.73.247.96"
else
  error "not deploying $TRAVIS_BRANCH branch"
fi

decode_ssh_key "$host"

now="$(date -u "+%Y%m%d%H%M%S")"
user="travisci"
root="/home/$user/sense-ebola-dashboard"

rsync -avz -e ssh "$dist/" $user@$host:$root/$now/
ssh $user@$host ln -fsn "$root/$now" "$root/latest"
