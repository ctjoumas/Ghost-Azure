const urlService = require('../../../../frontend/services/url');
const urlUtils = require('../../../lib/url-utils');

const urlsForPost = (id, attrs, options) => {
    attrs.url = urlService.getUrlByResourceId(id);

    if (options.columns && !options.columns.includes('url')) {
        delete attrs.url;
    }

    if (options && options.context && options.context.public && options.absolute_urls) {
        if (attrs.mobiledoc) {
            attrs.mobiledoc = urlUtils.mobiledocRelativeToAbsolute(
                attrs.mobiledoc,
                attrs.url
            );
        }

        ['html', 'codeinjection_head', 'codeinjection_foot'].forEach((attr) => {
            if (attrs[attr]) {
                attrs[attr] = urlUtils.htmlRelativeToAbsolute(
                    attrs[attr],
                    attrs.url
                );
            }
        });

        ['feature_image', 'og_image', 'twitter_image', 'canonical_url', 'url'].forEach((attr) => {
            if (attrs[attr]) {
                attrs[attr] = urlUtils.relativeToAbsolute(attrs[attr]);
            }
        });
    }

    if (options && options.withRelated) {
        options.withRelated.forEach((relation) => {
            // @NOTE: this block also decorates primary_tag/primary_author objects as they
            // are being passed by reference in tags/authors. Might be refactored into more explicit call
            // in the future, but is good enough for current use-case
            if (relation === 'tags' && attrs.tags) {
                attrs.tags = attrs.tags.map(tag => urlsForTag(tag.id, tag, options));
            }

            if (relation === 'author' && attrs.author) {
                attrs.author = urlsForUser(attrs.author.id, attrs.author, options);
            }

            if (relation === 'authors' && attrs.authors) {
                attrs.authors = attrs.authors.map(author => urlsForUser(author.id, author, options));
            }
        });
    }

    return attrs;
};

const urlsForUser = (id, attrs, options) => {
    if (options && options.context && options.context.public && options.absolute_urls) {
        attrs.url = urlUtils.urlFor({
            relativeUrl: urlService.getUrlByResourceId(id)
        }, true);

        if (attrs.profile_image) {
            attrs.profile_image = urlUtils.urlFor('image', {image: attrs.profile_image}, true);
        }

        if (attrs.cover_image) {
            attrs.cover_image = urlUtils.urlFor('image', {image: attrs.cover_image}, true);
        }
    }

    return attrs;
};

const urlsForTag = (id, attrs, options) => {
    if (options && options.context && options.context.public && options.absolute_urls) {
        attrs.url = urlUtils.urlFor({
            relativeUrl: urlService.getUrlByResourceId(attrs.id)
        }, true);

        if (attrs.feature_image) {
            attrs.feature_image = urlUtils.urlFor('image', {image: attrs.feature_image}, true);
        }
    }

    return attrs;
};

module.exports.urlsForPost = urlsForPost;
module.exports.urlsForUser = urlsForUser;
module.exports.urlsForTag = urlsForTag;
