#!/bin/bash

get_json_data()
{
  cat <<EOF
{"title":"$title","head":"$username:$branch_name","body":"$body","base":"develop"}
EOF
}

function createPullRequest() {
  remote_url=`git config remote.origin.url`;

  remote_url=${remote_url//https:\/\//}; # remove https://
  remote_url=${remote_url//git@github\.com\:/}; # remove git@github.com
  remote_url=${remote_url//github\.com\//}; # remove github.com
  username=`echo $remote_url | sed -e 's/\/.*$//g'`; # remove repo name
  repository_name=`basename -s .git $remote_url`;
  branch_name=$TRAVIS_BRANCH;
  title_prepare=`echo $branch_name | tr "/" " "`;
  title=`echo ${title_prepare:0:1} | tr '[a-z]' '[A-Z]'`${title_prepare:1};
  body=`git rev-list --simplify-by-decoration -2 $branch_name --pretty=format:"%h - %s"`;
  body=${body//\\/\\\\}; # \
  body=${body//\//\\\/}; # /
  body=${body//\'/\\\'}; # ' (not strictly needed ?)
  body=${body//\"/\\\"}; # "
  body=${body//   /\\t}; # \t (tab)
  body=${body//
/\\\n}; # \n (newline)
  body=${body//^M/\\\r}; # \r (carriage return)
  body=${body//^L/\\\f}; # \f (form feed)
  body=${body//^H/\\\b}; # \b (backspace)

  curl -i \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST --data "$(get_json_data)" \
  "https://api.github.com/repos/$username/$repository_name/pulls"
}

if [ $? -eq 0 ]; then
  createPullRequest
else
  echo 'failed to push commits and open a pull request.';
fi
