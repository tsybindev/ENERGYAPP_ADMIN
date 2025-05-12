import API from "../../../axiosConfig";

export async function getCatalog(token: string) {
    const response = await API.get('/catalogs/', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })

    return response.data
}