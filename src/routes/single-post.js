/**
 * @module routes/single-post
 */

const { Router } = require('express');

const {
	singlePostFormatter,
} = require('../utils/formatters/single-post-formatter');
const { request } = require('../data/request');
const {
	fbCommonMetaTags,
	socialMedias,
	subCategories,
	twitterCommonMetaTags,
	defalutMetaTagImageSrcStr,
} = require('../utils/config');
const { DISCOURSE_RESOURCE_MAP } = require('../utils/constants');
const {
	activeUsersFormatter,
} = require('../utils/formatters/active-users-formatter');
const { addActiveUsersToCache } = require('../data/cache/active-users');

function getMetaTags(topicId, formattedSinglePost) {
	return [
		{
			type: 'og:type',
			content: 'article',
		},
		{
			type: 'og:url',
			content: `https://samandhisfriends.com/single-post/${topicId}`,
		},
		{ type: 'og:title', content: formattedSinglePost.title },
		{
			type: 'og:description',
			content: formattedSinglePost.excerpt,
		},
		{
			type: 'og:image',
			content:
				(formattedSinglePost.heroImage &&
					formattedSinglePost.heroImage.srcStr) ||
				defalutMetaTagImageSrcStr,
		},
		{
			type: 'twitter:title',
			content: formattedSinglePost.title,
		},
		{
			type: 'twitter:description',
			content: formattedSinglePost.excerpt,
		},
		{
			type: 'twitter:image',
			content:
				(formattedSinglePost.heroImage &&
					formattedSinglePost.heroImage.srcStr) ||
				defalutMetaTagImageSrcStr,
		},
		...fbCommonMetaTags,
		...twitterCommonMetaTags,
	];
}

/**
 * Single post router
 * @param {object} router - router object init from express.Router
 * @returns router middleware
 */
module.exports = (router = new Router()) => {
	router.get('/:topicId', async (req, res) => {
		const topicResponse = await request({
			resource: DISCOURSE_RESOURCE_MAP.TOPIC(req.params.topicId),
		});

		const formattedActiveUsers = activeUsersFormatter(
			topicResponse.data.details.participants
		);

		await addActiveUsersToCache(formattedActiveUsers);

		const formattedSinglePost = await singlePostFormatter(topicResponse.data);
		const metaTags = getMetaTags(req.params.topicId, formattedSinglePost);

		res.render('singlePost', {
			metaTags,
			socialMedias,
			subCategories,
			isSinglePost: true,
			...formattedSinglePost,
		});
	});

	return router;
};
