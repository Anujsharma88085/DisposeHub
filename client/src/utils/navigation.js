let navigate;

export const setNavigate = (nav) => {
    navigate = nav;
};

export const navigateTo = (path) => {
    navigate?.(path);
};