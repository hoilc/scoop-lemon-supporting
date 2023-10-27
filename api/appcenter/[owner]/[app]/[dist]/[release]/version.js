import fetch from 'node-fetch';

export default async function handler(request, response) {
    const {owner, app, dist, release} = request.query

    const resp = await fetch(
        `https://install.appcenter.ms/api/v0.1/apps/${owner}/${app}/distribution_groups/${dist}/releases/${release}`,
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
            }
        }
    )

    const body = await resp.json();

    return response.end(`${body.version}/${body.id}`);
}
