class DtoMapper {

    constructor() {}

    toUserResponse(user) {
        return {
            id: user.id,
            firstName: user.firstName,
            secondName: user.secondName,
            email: user.email,
            sex: user.sex,
            photoPath: user.photoPath,
            registrationDate: user.registrationDate
        };
    }

    toUsersResponse(userPage) {
        return {
            meta: userPage.meta,
            data: userPage.data.map(user => this.toUserResponse(user))
        };
    }

    toJwsResponse(userWithJws) {
        return {
            jws: userWithJws.jws,
            user: this.toUserResponse(userWithJws.user)
        };
    }

    toErrorResponse(error) {
        return {
            message: error.message
        };
    }
};

export default DtoMapper;