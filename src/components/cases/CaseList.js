/* eslint-disable import/no-named-as-default */
import React from "react";
import PropTypes from "prop-types";
import db from "../../data/db";
import { caseShape } from "../../types";

export class CaseRow extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    case: caseShape
  };

  state = {
    editing: false
  };

  updateItem(c) {
    const f = document.forms["case-" + c._id];
    c.name = f.name.value;
    const action = {
      _id: "action-" + Date.now().toString(),
      type: "action",
      name: "updateCase",
      parameters: {
        _id: c._id,
        name: f.name.value
      }
    };
    db.bulkDocs([c, action]).then(x => {
      console.log("saved!", x);
      this.setState({ editing: false });
    });
  }

  render() {
    const { case: c } = this.props;
    return this.state.editing ? (
      <form
        id={"case-" + c._id}
        onSubmit={e => {
          e.preventDefault();
          this.updateItem(c);
        }}
      >
        {c._id} - <input type="text" defaultValue={c.name} name="name" />
        <input type="submit" value="save" />
      </form>
    ) : (
      <div>
        <h3>
          {c._id} - {c.name}{" "}
          <small>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                this.setState({ editing: true });
              }}
            >
              edit
            </a>
          </small>
        </h3>
      </div>
    );
  }
}

export class CaseList extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    cases: PropTypes.arrayOf(caseShape)
  };

  createItem() {
    const f = document.forms["new-case"];
    const c = { _id: "case-" + Date.now().toString(), name: f.name.value, type: "case" };
    const action = {
      _id: "action-" + Date.now().toString(),
      type: "action",
      name: "createCase",
      parameters: {
        _id: c._id,
        name: c.name
      }
    };
    db.bulkDocs([c, action]).then(() => {
      f.name.value = "";
    });
  }

  render() {
    return (
      <div>
        <ul>
          {this.props.cases.map(x => (
            <li key={x._id}>
              <CaseRow case={x} />
            </li>
          ))}
          <li>
            <form
              id={"new-case"}
              onSubmit={e => {
                e.preventDefault();
                this.createItem();
              }}
            >
              <label>
                new item: <input type="text" defaultValue={""} name="name" />
              </label>
              <input type="submit" value="save" />
            </form>
          </li>
        </ul>
      </div>
    );
  }
}

class PouchCaseList extends CaseList {
  static propTypes = {};

  state = {
    loading: true,
    cases: []
  };

  refreshDocs() {
    db.allDocs({ include_docs: true }).then(docs => {
      const cases = docs.rows
        .filter(x => x.doc.type === "case")
        .map(x => x.doc);
      this.setState({ cases, loading: false });
      return docs;
    });
  }

  componentDidMount() {
    this.refreshDocs();
    db
      .changes({
        since: "now",
        live: true,
        include_docs: false
      })
      .on("change", () => {
        this.refreshDocs();
      });
  }

  render() {
    return this.state.loading ? (
      <div>loading........</div>
    ) : (
      <CaseList cases={this.state.cases} />
    );
  }
}

export default PouchCaseList;
