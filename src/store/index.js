import { createStore , applyMiddleware,compose} from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './modules/rootSaga';
import rootReducer from './modules/rootReducer'

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer);
sagaMiddleware.run(rootSaga);

export default store;
