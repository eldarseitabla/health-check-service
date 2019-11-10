#!/bin/bash

generate_post_data()
{
  cat <<EOF
{
  "title": "$title",
  "head": "$username:$branch",
  "body": "$body",
  "base": "develop",
}
EOF
}

function createPullRequest() {
  remote_url=`git config --get remote.origin.url`;
  username=`echo "${remote_url/git@github.com:/}" | sed -e 's/\/.*$//g'`;
  repository_name=`basename -s .git $remote_url`;
  branch=`git branch | grep \* | cut -d ' ' -f2`;
  title_prepare=`echo $branch | tr "/" " "`;
  title=`echo ${title_prepare:0:1} | tr '[a-z]' '[A-Z]'`${title_prepare:1};
  body=`git log --pretty=format:"%h - %s"`;

  curl -d "$(generate_post_data)" -H "Authorization: token $GITHUB_TOKEN" -H "Content-Type: application/json" -X POST "https://api.github.com/repos/$username/$repository_name/pulls";
}

if [ $? -eq 0 ]; then
  createPullRequest
else
  echo 'failed to push commits and open a pull request.';
fi
