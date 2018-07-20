## Publishing a new version of this package

Once you have merged what you want to publish onto master:

```
git checkout master
git pull
```

Now that master is up to date in your local environment, make sure to run `npm install` to install any changes
you just pulled in and then make sure the tests still pass:

```
npm install
npm test
```

Do the changelog:

```
npm version
git-release-notes v<current_version>.. changelog/template.ejs > changelog.md
```

Ensure the changes that go into the changelog are indeed what you want to publish and are clear to others what the changes are:

```
git add changelog.md
git commit -m "changelog"
```

Tag the version. Now you've seen what is in the changelog, decide if this is a patch, minor or major release.
If only a mixture of bug fixes and dependency updates, it should be a patch.
If you've added a new feature, consider it a minor.
If it contains breaking changes, this is a major.

For guidance on these definitions, visit https://semver.org

```
npm version <patch | minor | major>
```

Push the tag to master:

```
git push --tag origin master
```

Publish to npm:

```
npm publish
```
