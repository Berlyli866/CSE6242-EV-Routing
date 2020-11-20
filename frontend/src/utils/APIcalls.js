class APIcalls {
    //flask backend
    static callFlaskBackend(latLong) {
        return fetch("http://localhost:5000/",{
            method:'post',
            mode:'cors',
            headers:{
                'Content-Type': 'application/json',
            },
            body:JSON.stringify(latLong)
        }).then(res => {
        // this.setState({ data: res["hello"] })
            return Promise.all([Promise.resolve(res),res.json()])
        })
    };

    //database api 
    static callPostgeSQL() {
        return fetch("http://localhost:3000/evtypes?select=*")
        .then(res => {
            // this.setState({ data2: res[0]["id"] })
            return Promise.all([Promise.resolve(res),res.json()])
        })
    };

}

export default APIcalls